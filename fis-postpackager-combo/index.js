var exports = module.exports = function (ret, conf, settings, opt) {
	var root = fis.project.getProjectPath();
	
	var res = ret.map.res;

	var rRequire = /(<script[^>]*>[^(<\/script>)]*?)(require\((.*?)\)[\s\S]*?)(?=<\/script>)/ig;

	var getId = function(path){
		return (path||'').replace(/^\//,'');
	}

    fis.util.map(ret.src, function(subpath, file) {
        if (file.isHtmlLike) {

		    var map = fis.file(root, settings.savePath , file.id.replace(/\//g,'') + '_combo.js');

		    var deps = [];

		    function getDeps(list){
		    	list.forEach(function(item){
		    		deps.unshift(item);
		    		var cdep = res[getId(item)];
			    	if(cdep && cdep.deps){
			    		getDeps(cdep.deps);
			    	}
			    });
		    }

		    getDeps(file.requires);

		    // console.log(deps,9999);

		    if(deps && deps.length){
			    var cont = '';
			    deps.forEach(function(item){
			    	if(ret.src[item]){
			    		cont += ret.src[item].getContent() + '\n';
			    	}
			    });

			    map.setContent(cont);

		        ret.pkg[map.subpath] = map;

		        var fcont = file.getContent();

		        fcont = fcont.replace(rRequire,function(all,$1,$2,$3){
		        	if($3){
		        		var url = map.url;
		        		if(map.useHash){
		        			url = url.replace(map.ext, '_' + map.getHash() + map.ext);
		        		}
		        		var sc = '<script type="text/javascript" src="' + url + '"></script>\n'
		        		return sc + all;
		        	}
		        });

		        file.setContent(fcont);
	        }
        }
    });
};





