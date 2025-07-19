import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {useContext, useEffect} from 'react';
import 'slim-select/styles';
import AppContext from "../provider/AppContext.jsx";
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function PageHeader({children, icon, title, showSpinner=false}){
	const appProvider = useContext(AppContext);

	useEffect(()=>{
		let display = 'OTA Order System';
		if(title) document.title = `${title} :: ${display}`;
		else document.title = display;
		return ()=>document.title = display;
	}, [title]);

	return (<>
		<div className='row'>
			<div className='col-md-8'>
				<h3>{icon && <FontAwesomeIcon icon={icon} />}{icon && ' '}{title} {showSpinner && <FontAwesomeIcon icon={faSpinner} className="sm text-secondary fa-spin-pulse" />}</h3>
			</div>
			<div className='col-md-4'>
				
			</div>
		</div>
		{children}
		<hr className='mt-2' />
	</>);
}