import {useContext, useState, useRef, useCallback, useEffect} from 'react';
import AppContext from "../provider/AppContext.jsx";
import $ from 'jquery';
import 'select2';

export default function OTICSelect({onChange, initialValue = null, disabled=false}){
	const appProvider = useContext(AppContext);

	let [errorText, setErrorText] = useState(null);
	let selectRef = useRef(null);

	const [select2Initialized, setSelect2Initialized] = useState(false);

	const setSelectRef = useCallback(node => {

		// Node doesn't exist, do some cleanup
		if (!node) {
			if (selectRef.current && $(selectRef.current).data('select2')) {
				$(selectRef.current).select2('destroy');
			}
			selectRef.current = null;
			setSelect2Initialized(false);
			return;
		}

		selectRef.current = node;

		// Initialize the select
		if (!$(node).data('select2')) {
			$(node).select2({
				placeholder: 'Select an Industry Code',
				ajax: {
					url: 'https://rockwell.ourtownamerica.com/intra/api/ordersys/select2otics.php',
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

			$(node).on('select2:select', function (e) {
				let selectedData = $(node).select2('data');
				if (selectedData && selectedData.length > 0) {
					const {id, text} = selectedData[0];
					setErrorText(null);
					onChange({id, text});
				} else {
					setErrorText('No Industry Code selected.');
					onChange(null);
				}
			});

			$(node).on('select2:unselect', function (e) {
				setErrorText(null);
				onChange(null);
			});

			setSelect2Initialized(true);

		}

	}, [appProvider, onChange]);

	// Select the inital value, if it exists
	useEffect(() => {
		if (select2Initialized && selectRef.current) {
			const $select = $(selectRef.current);

			if (initialValue && initialValue.id && initialValue.text) {
				if (!$select.find(`option[value="${initialValue.id}"]`).length) {
					const option = new Option(initialValue.text, initialValue.id, true, true);
					$select.append(option);
				}
				$select.val(initialValue.id).trigger('change');
			} else {
				$select.val(null).trigger('change');
			}
		}
	}, [initialValue, select2Initialized]);

	return (
		<div className="form-group">
			<select className="form-control" ref={setSelectRef} disabled={disabled} />
			{errorText && <div className="form-text text-danger">{errorText}</div>}
		</div>
	);
}