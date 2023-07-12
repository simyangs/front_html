const commApp = (()=>{
    let exports = {};
    
    exports.board = function(el, context){
		this.$target = $(el, context);
        this.contentImgList = [];
        this.tempImgPath = `temp/${moment().format('YYYYMMDD')}/${commUtil.getUUID()}`;
        this.$target.summernote({
            height: 300,
            minHeight: null,             // 최소 높이
            maxHeight: null,             // 최대 높이
            focus: false,
            lang: 'ko-KR',
            toolbar: [
                //['style', ['style']],
                ['font', ['bold', 'underline', 'clear']],
                ['fontname', ['fontname']],
                ['color', ['color']],
                ['para', ['ul', 'ol', 'paragraph']],
                ['table', ['table']],
                ['insert', ['link', 'picture', 'video']],
                //['view', ['codeview', 'help']],
            ],
            fontNames: ['Arial', 'Arial Black', 'Comic Sans MS', 'Courier New','맑은 고딕','궁서','굴림체','굴림','돋움체','바탕체'],
            fontSizes: ['8','9','10','11','12','14','16','18','20','22','24','28','30','36','50','72'],
            callbacks: {
                onImageUpload: (files)=>{
                    console.log(this);
                    for(file of files){
                        let formData = new FormData();
                        formData.append('file', file);
                        formData.append('path', this.tempImgPath);

                        commAjax.file('/board/uploadimage', formData)
                        .then((data)=>{
                            this.$target.summernote('insertImage', data);
                            this.contentImgList.push(data);
                        });
                    }
                }
            }
        });

        this.getCode = function(){ 
            return this.$target.summernote('code')
        }
        
        this.getTempImgPath = function(){
			return this.tempImgPath;
		}
		
		this.getContentImgList = function(){
			const content = this.getCode();
			
			var result = [];
			for(img of this.contentImgList){
                if(content.indexOf(img) > -1) result.push(img);
            }
            return result;
		}
        
    }
    
    
    /* 
    fields : [
		{
			name: '메핑ID',
			label: '헤더명',
			width: '크기',
			align: '정렬',
			formatter: '값변경 function(row)',
			visible: '표시여부'
		}	
	],
 	option: {
		 selectType: 'checkbox', checkbox 컬럼추가
		 // 페이지 정보
		 pagination: {
			 targetId: '페이지 표시 element id',
			 itemCount: '페이지 번호 표시건 default 10',
			 perPage: '페이지 사이즈' default 10,
			 onChange: '페이지 변경 function(페이지번호)'
		 },
		 // 이벤트
		 event: {
			 rowClick: 'row click function({rowindex, colId, data})'
		 }
	 }
	*/
    exports.grid = function(id, fields, option){
		const $target = $('#'+id);
		const _fields = fields;
		const _data = [];
		const _pagination = option && option['pagination'] ? option.pagination : null;
		const _event = option && option['event'] ? option.event : null;
		const _selectType = option && option['selectType'] ? option.selectType : null;
		
		// data set
		this.setData = function(data){
			console.log('setData::', data);
			_data.splice(0, _data.length);
			data.forEach((item)=> {
				let obj = {};
				for(const col of fields){
					if(col['name']){
						if(col.formatter){
							obj[col.name] = col.formatter(item);
						}else{
							obj[col.name] = item[col.name];
						}
					}
				}
				_data.push(obj);
			});
			console.log('_data::', _data);
			renderBody();
		}

		// pagination set
		this.setPagination = function(totalCount, page){
			if(_pagination == null) throw 'pagination not found';
			
			const pageInfo = getPageInfo(totalCount, page);
		    console.log(pageInfo);
		    
		    const $div = $('<div class="pagination">');
		    
		    $div.append(getPageLink('&laquo;', pageInfo.isPrevExist, 1));
		    $div.append(getPageLink('&lt;', pageInfo.isPrevExist, pageInfo.prevPageNum));
		    
		    
		    
		    for(const n of pageInfo.pageList){
				const $pageA = $('<a>');
				$pageA.text(n);
				if(page === n)$pageA.addClass('active');
				else $pageA.on('click', ()=> _pagination.onChange(n)); 
				$div.append($pageA);
			}
			
		    $div.append(getPageLink('&gt;', pageInfo.isNextExist, pageInfo.nextPageNum));
			$div.append(getPageLink('&raquo;', pageInfo.isNextExist, pageInfo.totalLastPageNum));
			
			const $pager = $("#"+ _pagination.targetId);
		    
		    $pager.empty();
		    $pager.append($div);
		    
		}
		
		// row data 
		this.getData = function(){
			return _data;
		}
		
		
		// seleted row data
		this.selectedRow = ()=>{
			const row = [];
			if(_selectType){
				if(_selectType == 'checkbox'){
					$target.find('tbody [data-selecttype="checkbox"]:checked').each((i, item)=>{
						row.push(_data[$(item).data('rowindex')]);
					});
				}
			}
			return row;
		}
		
		this.exportExcel = (filename)=>{
			const workbook = XLSX.utils.table_to_book($target.find('table')[0]);
        	console.log(workbook);
        	XLSX.writeFile(workbook, filename);
		}
		
		// page info
		function getPageInfo(totalCount, currentPageNum){
		    const pagesPerBlock = _pagination['itemCount'] || 10;
		    const postsPerPage = _pagination['perPage'] || 10;
		    let totalLastPageNum = 0;
		    let totalPostCount = totalCount;
		
		    if(totalPostCount == 0){
		        totalLastPageNum = 1;
		    }else{
		        totalLastPageNum = parseInt(Math.ceil(totalPostCount/postsPerPage));
		    }
		
		    let blockLastPageNum = totalLastPageNum;
		    let blockFirstPageNum = 1;
		    const mod = totalLastPageNum % pagesPerBlock;
		    
		    if(totalLastPageNum - mod >= currentPageNum) {
		        blockLastPageNum = parseInt(Math.ceil(currentPageNum/pagesPerBlock) * pagesPerBlock);
		        blockFirstPageNum = blockLastPageNum - (pagesPerBlock - 1);
		
		    }else{
		        blockFirstPageNum = parseInt(Math.ceil(currentPageNum/pagesPerBlock) * pagesPerBlock) - (pagesPerBlock -1);
		    }
		
		    let pageList = [];
		    for(let i=blockFirstPageNum; i<=blockLastPageNum; i++){
		        pageList.push(i);
		    }
		    const prevPageNum = currentPageNum > 1 ? currentPageNum - 1 : 1;
		    const nextPageNum = currentPageNum < totalLastPageNum ? currentPageNum + 1 : totalLastPageNum;
		
		    return {
		        isPrevExist: currentPageNum > 1,
		        isNextExist: currentPageNum < totalLastPageNum,
		        totalLastPageNum : totalLastPageNum,
		        blockLastPageNum: blockLastPageNum,
		        blockFirstPageNum: blockFirstPageNum,
		        currentPageNum: currentPageNum,
		        totalPostCount: totalPostCount,
		        pagesPerBlock: pagesPerBlock,
		        postsPerPage: postsPerPage,
		        pageList: pageList,
		        prevPageNum: prevPageNum,
		        nextPageNum: nextPageNum
		    }
		}
		
		// page tag 생성
		function getPageLink(text, isEnable, pageNo){
			
			const $pageA =  $('<a>');
			$pageA.html(text);
			if(isEnable) $pageA.on('click', ()=> _pagination.onChange(pageNo));
			else $pageA.attr('disabled', true);
			
			return $pageA; 
		}
		
		// thead render
		const renderHeader = ()=>{
			const $table = $('<table class="comm_table">');
			const $colgroup = $('<colgroup>');
			const $thead = $('<thead class="comm_table_thead">');
			const $tr = $('<tr>');
			
			// selecttype
			if(_selectType){
				// checkbox
				if(_selectType == 'checkbox'){
					const $col = $(`<col width="40px" ></col>`);
					const  $th = $(`<th><input type="checkbox" /></th>`);
					
					// th click 시에도 check
					$th.on('click', function(e){
						if($(e.target).attr('type') == 'checkbox') return;
						
						const checked = $th.find('input').prop('checked');
						$th.find('input').prop('checked', !checked);
						$th.find('input').trigger('change');
					});
					
					// all check
					$th.find('input').on('change', function(e){
						const checked = $(e.target).prop('checked');
						
						$target.find('tbody [data-selecttype="checkbox"]').each((i, item)=>{
							$(item).prop('checked', checked);
						});
					});
					$colgroup.append($col);
					$tr.append($th);
				}
			}
			
			// thead
			_fields.forEach((item)=>{
				const visible = item['visible'] != null ? item.visible : true;
				
				if(visible == true){
					console.log(visible);
					let width = item.width;
					if(width && $.isNumeric(width)) width += 'px';
					else width = 'auto';
					const $col = $(`<col width="${width}" ></col>`);
					const  $th = $(`<th>${item.label}</th>`);
					$colgroup.append($col);
					$tr.append($th);
				}
			});
			$thead.append($tr);
			$table.append($colgroup);
			$table.append($thead);
			$table.append($('<tbody class="comm_table_tbody">'));
			$target.append($table);
		}
		
		
		// tbody render
		const renderBody = ()=>{
			const $tbody = $target.find('.comm_table_tbody');
			$tbody.empty();
			
			if(_data.length == 0){
				$tbody.append(`<tr><td colspan="${_fields.length}"><div class="no-data"><p>조회내역이 없습니다.</p></div></td></tr>`);
			}else{
				_data.forEach((row, rowindex)=>{
					
					const $tr = $('<tr>');
					
					// selecttype 
					if(_selectType){
						// checkbox
						if(_selectType == 'checkbox'){
							const  $td = $(`<td class="align-center"><input type="checkbox" data-selecttype="checkbox" data-rowindex="${rowindex}" /></td>`);
							// td click 시에도 check
							$td.on('click', function(e){
								if($(e.target).attr('type') == 'checkbox') return;
								
								const checked = $td.find('input').prop('checked');
								$td.find('input').prop('checked', !checked);
							});
							$tr.append($td);
						}
					}
					// tbody
					_fields.forEach((col, colindex)=>{
						const visible = col['visible'] != null ? col.visible : true;
						if(visible == true){
							const $td = $('<td>');
							if(col.align) $td.addClass(`align-${col.align}`);
							else $td.addClass(`align-center`);
							
							if(col.addClass) $td.addClass(col.addClass);
							
							if(col['name']){
								$td.text(row[col.name]);	
							}else if(col.formatter){
								$td.text(col.formatter(row));
							}
							
							
							
							// click event
							if(_event && typeof _event['rowClick'] == 'function'){
								$td.on('click', $.proxy(()=>{
									_event.rowClick({
										rowIndex: rowindex,
										colId: col.name,
										data: row
									});
								}));	
							}
							$tr.append($td);
						}
					});
					
					$tbody.append($tr);
				})
				
			}
		}
		
		
		const render = (list)=>{
			$target.empty();
			renderHeader();
			renderBody();
		}
		
		render();
	}
	
	
	
	
    return exports;
})();