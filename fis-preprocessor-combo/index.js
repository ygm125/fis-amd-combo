var exports = module.exports = function (content, file, settings) {

    var rRequire = /(<script[^>]*>[^(<\/script>)]*?)(require\((.*?)\)[\s\S]*?)(?=<\/script>)/ig;

    var rDefine = /(define\s*\(\s*(["'].*?["'])?\s*,?)\s*(\[.*?\])?\s*,?\s*function\(/i;

    var deps = [];

    var absoluteUri = function(str){
        str = str || '';
        if(/^https?:\/\//.test(str)){

        }else if(/^\//.test(str)){
            str = fis.util(settings.baseUrl,str);
        }else if(/^(\.\/|\.\.\/)/.test(str)){
            str = fis.util(file.subdirname,str);
        }else{
            str = fis.util(settings.baseUrl,str);
        }
        if(!/.js$/.test(str)){
            str += '.js';
        }
        return str;
    }

    var changeUri = function(str){

        if(Array.isArray(str)){
            var rtn = [];
            str.forEach(function(item){
                rtn.push(absoluteUri(item));
            });
            return rtn;
        }
        if(typeof str === 'string'){
            return absoluteUri(str);
        }
    }

    content = content.replace(rRequire ,function(all,$1,$2,$3,$4){

        if($3){

            var arr = changeUri(eval($3));

            $2 = $2.replace($3,JSON.stringify(arr));

            deps = deps.concat(arr);

            return $1 + $2;
        }

    }).replace(rDefine ,function(all,$1,$2,$3,$4){

        if($2){//有id
            var lc = $2[0];
            var rc = $2[$2.length-1];
            var str = $2.slice(1,-1);

            var rep = changeUri(str);

            all = all.replace($2,lc + rep + rc);
        }else{
            all = all.replace($1,$1 + '"' + file.url + '",');
        }

        if($3){//有依赖
            var arr = changeUri(eval($3));
            all = all.replace($3,JSON.stringify(arr));

            deps = deps.concat(arr);
        }

        return all;
    });

    deps.forEach(function(item){
        file.addRequire(item);
    });

    return content;
};
