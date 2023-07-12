const commAjax = (()=>{
	
    const exports = {};

    function getCsrf(){
        //return $("head meta[name='_csrf']").attr('content');
        return '';
    }

    async function callAjax(url, method, contentType, data){
        console.log("=================[request]====================");
        console.log("url::", url);
        console.log("method::", method);
        console.log("data::", data);

		//url = api_url + url;
		
        return new Promise((resolve, reject) => {
            
            if(method == 'post' && data){
				data._csrf = getCsrf();
            }
            
            $.ajax({
                beforeSend: function (xhr) {
                    commUtil.setLoading(true);
                },
                url: '/api'+url,
                type: method,
                data: data,
                dataType: 'json',
                contentType: contentType
            }).done((data)=>{
                console.log("=================[response]====================");
                console.log(data);
                if(data.result == 'true'){
                    resolve(data.data);
                }else{
                    alert(` code: ${data.result} \n message: ${data.message}`);
                    reject(data.message);
                }
            }).fail((xhr, status, error)=>{
                console.log("code: " + xhr.status);
                console.log("message: " + xhr.responseText);
                console.log("error: " + error);
                alert(` code: ${xhr.status} \n message: ${xhr.responseText} \n error: ${error}`);
                reject(error);
            }).always(()=>{
                commUtil.setLoading(false);
            });
        });
    }

    exports.get = async function(url, data){
        return await callAjax(url, 'get', 'application/json', data);
    }

    exports.post = async function(url, data){
		data = data ? JSON.stringify(data) : data;
        return await callAjax(url, 'post', 'application/json', data);
    }
    
    exports.postForm = async function(url, data){
		return await callAjax(url, 'post', 'application/x-www-form-urlencoded; charset=UTF-8', data);
	}

    exports.file = async function(url, formData){
        console.log("=================[request file]====================");
        console.log("url::", url);
		
		//url = api_url + url;
		
        return new Promise((resolve, reject) => {

            $.ajax({
                beforeSend: function (xhr) {
                    commUtil.setLoading(true);
                    xhr.setRequestHeader('X-CSRF-Token', getCsrf());
                },
                url: '/api'+url,
                type: 'post',
                data: formData,
                contentType: false,
                processData: false
            }).done((data)=>{
                console.log("=================[response]====================");
                console.log(data);
                if(data.result == 'true'){
                    resolve(data.data);
                }else{
                    alert(` code: ${data.result} \n message: ${data.message}`);
                    reject(data.message);
                }
            }).fail((xhr, status, error)=>{
                console.log("code: " + xhr.status);
                console.log("message: " + xhr.responseText);
                console.log("error: " + error);
                alert(` code: ${xhr.status} \n message: ${xhr.responseText} \n error: ${error}`);
                reject(error);
            }).always(()=>{
                commUtil.setLoading(false);
            });
        });

    }

    return exports;
})();