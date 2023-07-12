const commUtil = (()=>{
    let exports = {};

    console.log('api_url :: ', api_url);

    exports.queryStringToJSON = function(str){
        str = str.replace('?', '');
        var pairs = str.split('&');
        var result = {};
        pairs.forEach(function (pair) {
            pair = pair.split('=');
            var name = pair[0]
            var value = pair[1]
            if (name.length)
                if (result[name] !== undefined) {
                    if (!result[name].push) {
                        result[name] = [result[name]];
                    }
                    result[name].push(value || '');
                } else {
                    result[name] = value || '';
                }
        });
        return (result);
    }

    exports.jsonToQueryString = function(json){
        console.log(json);
        if(!json) return '';
        return Object.entries(json).map(([key, value])=>(value && key + '=' + value)).filter(v=>v).join('&');
    }

    exports.setLoading = function(visible){
        if (visible) $(".spinner-border").show();
        else $(".spinner-border").hide();
    };

    exports.goLocation = function(url, paramJson){
        
        const strUrl = exports.jsonToQueryString(paramJson);
        if(strUrl != '') url += '?'+strUrl;
        location.href = url;
    }

    exports.getUUID = function(){
        return crypto.randomUUID();
    }

    exports.unescapeHtml = function(str){
        const regex = /&(amp|lt|gt|quot|#39);/g;
        const chars = {
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#39;': "'"
        }
        if(regex.test(str)) {
            return str.replace(regex, (matched) => chars[matched] || matched);
        }else return str;
    }
    
    
    

    return exports;
})();