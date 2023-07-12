const comm = (()=>{
	let exports = {};
	
	const serverUrl = {
		prod: ['prod.com'],
		test: ['test.com'],
		dev: ['dev.com'],
		local: ['localhost', '127.0.0.1']
	}
		
	exports.start = ()=>{
	
		return new Promise(async(resolve)=>{
			const serverType =  getServerType();
			
			await $.getScript(`js/config_${serverType}.js`);
				
			await $.getScript(`js/commUtil.js`);
			await $.getScript(`js/commAjax.js`);
			await $.getScript(`js/commApp.js`);
			await $.getScript(`js/commView.js`);
			
				
			console.log('script load');
			
			commView.includeHtml();
			
			if(serverType != 'prod'){
				document.title = `(${serverType.toUpperCase()}) ${document.title}`;
			}
			
			resolve();
		});
	};
	
	const getServerType = ()=>{
		
		for(const type in serverUrl){
			if(serverUrl[type].indexOf(location.hostname) > -1){
				console.log(type);
				return  type;
			}
		}
	}
	
	exports.getServerType = getServerType();
	
	
	
	return exports;
})();
