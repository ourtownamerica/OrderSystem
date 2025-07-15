(()=>{
	let base_url = '/';
	if(window.location.host == 'localhost') base_url = '/new_order_system/public/';
	if(window.location.host == 'ourtownamerica.github.io') base_url = '/OrderSystem/public/';
	
	const loadLocalScript = (src, isModule) => {
		let script = document.createElement('script');
		if(isModule) script.setAttribute('type', 'module');
		script.setAttribute('src', src);
		document.body.append(script);
	};

	loadLocalScript(`${base_url}assets/js/main.js?build=0.0.000`, true);
	loadLocalScript(`${base_url}assets/js/bootstrap.bundle.js`);
})(); 