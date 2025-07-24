import {useState, useContext} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faSpinner} from '@fortawesome/free-solid-svg-icons'
import AppContext from "../provider/AppContext.jsx";

export function TerritoryChooser({onAddTerritories}){
	const appProvider = useContext(AppContext);

	const [searchRadius, setSearchRadius] = useState(0);
	const [loading, setLoading] = useState(false);
	const [errorMsg, setErrorMsg] = useState(false);
	const [fieldValue, setFieldVal] = useState('');
	const [useCrrts, setUseCrrts] = useState(false);

	const findRoutesOrZips = async e =>{
		e.preventDefault();
		if(loading) return;

		setErrorMsg('');
		setLoading(true);

		let territories;

		try{
			let data = await appProvider.territorySearch(fieldValue, searchRadius);
			territories = useCrrts ? data.routes : data.zips;
			if(!territories.length){
				setErrorMsg(`No ${useCrrts?'routes':'zips'} found for ${fieldValue}.`);
				setLoading(false);
				return;
			}
		}catch(e){
			setErrorMsg(e);
			setLoading(false);
			return;
		}

		setLoading(false);
		setFieldVal('');
		onAddTerritories(territories);
	};

	const setRadius = (e, rad) => {
		e.preventDefault();
		if(loading) return;
		setSearchRadius(+rad);
	};

	const onTypeChange = e=>{
		if(e.currentTarget.checked){
			setUseCrrts(e.currentTarget.value === 'crrt');
		}
	};

	let dd_text = searchRadius > 0 ? `${useCrrts?'Routes':'Zips'} in ${searchRadius} mi Radius` : `${(useCrrts?'Routes in c':'C')}losest zip only`;
	let btn_text = searchRadius > 0 ? `Search ${useCrrts?'Routes':'Zips'}` : `Search ${useCrrts?'Routes':'Zip'}`;
	if(loading) btn_text = <FontAwesomeIcon icon={faSpinner} spin pulse />;
	let placeholderText = searchRadius > 0 ? `Center point (address or zip)` : `Location of ${useCrrts?'route':'zip'} (address or zip)`;
	return (<form className="mb-3" onSubmit={findRoutesOrZips}>
		<div className='mb-3'>
			<b>Territory Type: </b>
			<label className="radio-inline"><input type="radio" name="zip-type-opt" value='zip' checked={!useCrrts && 'checked'} onChange={onTypeChange} /> Zip Codes</label>&nbsp;&nbsp;
			<label className="radio-inline"><input type="radio" name="zip-type-opt" value='crrt' checked={useCrrts && 'checked'} onChange={onTypeChange} /> Carrier Routes</label>
		</div>
		<div className="input-group">
			<input disabled={loading} type="text" className="form-control" placeholder={placeholderText} value={fieldValue} onChange={e=>setFieldVal(e.currentTarget.value)} />
			<button disabled={loading} className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">{dd_text}</button>
			<ul className="dropdown-menu">
				<li><a className="dropdown-item" href="#" onClick={e=>setRadius(e, 0)}>{useCrrts?'Routes in c':'C'}losest zip only</a></li>
				<li><hr className="dropdown-divider" /></li>
				<li><a className="dropdown-item" href="#" onClick={e=>setRadius(e, 1)}>{useCrrts?'Routes':'Zips'} in 1 mi Radius</a></li>
				<li><a className="dropdown-item" href="#" onClick={e=>setRadius(e, 2)}>{useCrrts?'Routes':'Zips'} in 2 mi Radius</a></li>
				<li><a className="dropdown-item" href="#" onClick={e=>setRadius(e, 3)}>{useCrrts?'Routes':'Zips'} in 3 mi Radius</a></li>
				<li><a className="dropdown-item" href="#" onClick={e=>setRadius(e, 4)}>{useCrrts?'Routes':'Zips'} in 4 mi Radius</a></li>
				<li><a className="dropdown-item" href="#" onClick={e=>setRadius(e, 5)}>{useCrrts?'Routes':'Zips'} in 5 mi Radius</a></li>
				<li><a className="dropdown-item" href="#" onClick={e=>setRadius(e, 6)}>{useCrrts?'Routes':'Zips'} in 6 mi Radius</a></li>
				<li><a className="dropdown-item" href="#" onClick={e=>setRadius(e, 7)}>{useCrrts?'Routes':'Zips'} in 7 mi Radius</a></li>
				<li><a className="dropdown-item" href="#" onClick={e=>setRadius(e, 8)}>{useCrrts?'Routes':'Zips'} in 8 mi Radius</a></li>
				<li><a className="dropdown-item" href="#" onClick={e=>setRadius(e, 9)}>{useCrrts?'Routes':'Zips'} in 9 mi Radius</a></li>
				<li><a className="dropdown-item" href="#" onClick={e=>setRadius(e, 10)}>{useCrrts?'Routes':'Zips'} in 10 mi Radius</a></li>
			</ul>
			<button disabled={loading} className="btn btn-outline-secondary" type="submit">{btn_text}</button>
		</div>
		{errorMsg && <div><small className='text-danger'>{errorMsg}</small></div>}
	</form>);
}