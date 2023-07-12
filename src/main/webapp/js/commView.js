const commView = (()=>{
	let exports = {};
	let routes = [];
	let view = {};
	let modal = {};
	
	function getMenuUrl(id){
		const path = id.substr(0,2).toLowerCase();
		return `html/${path}/${id}.html`;
	}
	
	function getMenu(id){
		const menu = routes.find((item)=> item.id == id);
		console.log('getMenu::', menu);
		return menu;
	}
	
	async function loadMenu(id, param){
		console.log('====================[loadMenu]======================');
		console.log('id:', id);
		
		return new Promise((resolve, reject)=>{
			const menu = getMenu(id);
			if(!menu){
				alert('페이지를 찾을 수 없습니다.');
				reject('page not found');
			}
			
			const menuUrl = getMenuUrl(id);
			$('#main_contents').load(menuUrl, (res, status, xhr)=>{
				console.log('status: ', status);
		    	console.log('xhr: ', xhr);
		    	if(status == 'error'){
					if(xhr.status == '401')
						alert('로그인이 필요합니다.');
					else if(xhr.status == '403')
						alert('접근권한이 없습니다.');
					else if(xhr.status == '404')
						alert('페이지를 찾을 수 없습니다.');
					else
						alert('오류가 발생하였습니다.');
						
					reject();
		  		}else{
					
					const pageObj = view[id](param);
					if(typeof pageObj.onload === 'function') pageObj.onload();
					if(typeof pageObj.event === 'function') pageObj.event();
					
					const target = $(`.lnb-container [data-id='${id}']`);
					if(target.length > 0){
						const targetParent = target.parent().parent().parent();
						if(!targetParent.hasClass('nav-item-open')) targetParent.children('.extend').click();
						
						$('.lnb-container .nav-item').each((i, item)=>{
							$(item).removeClass('selected');
						});
						target.closest('li').addClass('selected');
					}
			
					console.log('loadMenu::', menu);
					
					resolve(true);
				}
			});
		});
	};
	
	exports.loadModal = async(id, param) => {
    
		return new Promise((resolve, reject)=>{
			const menu = getMenu(id);
			if(!menu){
				alert('페이지를 찾을 수 없습니다.');
				reject();
			}
			
			const menuUrl = getMenuUrl(id);
			const elModal = $(`<div class="modal" tabindex="-1" id="modal_${id}"></div>`);
	    	elModal.load(menuUrl, (res, status, xhr)=>{
				console.log('status: ', status);
				console.log('xhr: ', xhr);
				if(status == 'error'){
					if(xhr.status == '401')
						alert('로그인이 필요합니다.');
					else if(xhr.status == '403')
						alert('접근권한이 없습니다.');
					else if(xhr.status == '404')
						alert('페이지를 찾을 수 없습니다.');
					else
						alert('오류가 발생하였습니다.');
	          		reject();
				}else{
					
					
					$('body').append(elModal);
					
					const insModal = new bootstrap.Modal(elModal, { backdrop: "static" });
	
					const closeFn = (res)=>{
						if(res) resParam = res;
						insModal.hide();
					}
	
					insModal.show();
					
					
					const modalObj = modal[id](param, closeFn);
					if(typeof modalObj.onload === 'function') modalObj.onload();
					if(typeof modalObj.event === 'function') modalObj.event();
					
	        
					let rs = true;
					$(elModal)
						.find(".btn-close, .btn-cancel")
						.on("click", () => {
							rs = false;
							insModal.hide();
						});
					$(elModal).on('hidden.bs.modal', function(){
						$(this).remove();
						insModal.dispose();
					
						if(rs && resParam) {
							rs = resParam;
						}
						resolve(rs);
					});
				}
			});
		});
	}
	
	
	
	exports.goMenu = (id, param, isPopSate)=>{
		const menu = getMenu(id);
		if(menu){
			
			let url = menu.menuUrl;
			if(menu.params.length > 0){
				menu.params.forEach((paramKey, i)=>{
					if(param[paramKey]){
						url += ('/' + param[paramKey]);  
					}
				});
			}
			window.location.href = url;
		}
	}
	
	exports.view = (id, obj)=>{
		view[id] = obj;
	}
	
	exports.modal = (id, obj)=>{
		modal[id] = obj;
	}
	
	exports.getView = ()=> {console.log(view)};
	
	
	function createRouter(){
		const ROUTE_PARAMETER_REGEXP = /:(\w+)/g
		const URL_REGEXP = '([^\\/]+)'
		
		const router = {
			addRoute(fragment, id){
				console.log('addRoutes', fragment +' - '+ id)
				if(!fragment.startsWith('#')) fragment = '#'+fragment;
				
				const params = [];
				const parsedFragment = fragment.replace(ROUTE_PARAMETER_REGEXP, (_, paramName)=>{
					params.push(paramName);
					return URL_REGEXP;
				}).replace(/\//g, "\\/");
				
				let menuUrl = fragment;
				if(params.length > 0){
					menuUrl = menuUrl.substr(0, menuUrl.search(ROUTE_PARAMETER_REGEXP)-1);
				}
				
				routes.push({
					id,
					fragment,
					menuUrl,
					fragRegExp: new RegExp(`^${parsedFragment}$`),
					params
				});
				return this;
			},
			
			
			
			start(){
				const getUrlParams = (route, hash)=>{
					const params = {};
					const matches = hash.match(route.fragRegExp);
					
					matches.shift();
					matches.forEach((paramVal, index)=>{
						const paramName = route.params[index];
						params[paramName] = paramVal;
					});
					return params;
				};
				
				console.log(routes);
				const checkRoutes = ()=>{
					
					const route = routes.find((item)=> item.fragRegExp.test(window.location.hash));
					console.log('checkRoutes', route);
					if(route){					
						let params = {};
						
						if(route.params.length > 0){
							params = getUrlParams(route, window.location.hash);
						}
						loadMenu(route.id, params);
					}else{
						$('#main_contents').empty();
					}
				}
				
				window.addEventListener('hashchange', checkRoutes);
				checkRoutes();
			}
		}
		
		return router;
	}
	
	exports.setMenuList = (list)=> {
		console.log(list);
		const router = createRouter();
		console.log(router);
		for(const item of list){
			if(item.menuType != 'G') {
				router.addRoute(item.menuUrl, item.menuId);
			}
		}
		router.start();
	}
	
	exports.includeHtml = ()=>{
		$('[data-include-file]').each((index, el)=>{
			const url = $(el).data('include-file');
			console.log('include html :: ', url);
			$(el).load(url);
		});
	};
	
	exports.devLoadMenu = (id)=>{
		if(comm.getServerType != 'local') return;
		
		loadMenu(id, {});
	}
	
	return exports;
})();