
import {useContext, useState, useRef, useCallback} from 'react';
import AppContext from "../provider/AppContext.jsx";
import $ from 'jquery';
import 'select2';

export default function AccountSelect({onChange}){
	const appProvider = useContext(AppContext);

	let [loading, setLoading] = useState(false);
	let [errorText, setErrorText] = useState();
	let selectRef = useRef();

	const setSelectRef = useCallback(node=>{
		if(!node) return;
		selectRef.current = node;
		$(selectRef.current).select2({
			placeholder: 'Select an Account',
			ajax: {
				url: 'https://rockwell.ourtownamerica.com/intra/api/ordersys/select2accounts.php',
				dataType: 'json',
				delay: 250,
				data: function(p){
					return {
						token: appProvider.getProp('session_id'),
						term: p.term,
						page: p.page || 1
					};
				},
				cache: true,
			},
			theme: 'bootstrap-5',
		});
		$(selectRef.current).on('select2:select', async function (e) {
			let selected = $(selectRef.current).select2('data');
			if(!selected.length){
				setErrorText('No account selected.');
			}else{
				setErrorText(false);
				try{ $(selectRef.current).select2('destroy'); }catch(e){}
				setLoading(true);
				try{
					let details = await appProvider.getAccountDetails(selected[0].id);
					setLoading(false);
					onChange(details);
				}catch(e){
					setErrorText(e);
					setLoading(false);
				}
				
			}
		});
	});
	
	return (<div className="form-group">
		<select className="form-control" ref={setSelectRef} disabled={loading} />
		{errorText && <div className="form-text text-danger">{errorText}</div>}
	</div>);
}