import { useParams, useNavigate } from "react-router-dom";
import {useEffect, useContext} from 'react';
import AppContext from "../provider/AppContext.jsx";

export default function C(){
	const {slugOrId} = useParams();
	const navigate = useNavigate();
	const appProvider = useContext(AppContext);

	useEffect(()=>{
		(async ()=>{
			await appProvider.setVanity(slugOrId);
			navigate('/');
		})();
	}, [slugOrId]);

	return (<div className='centered-overlay'>
		<small className='text-secondary'>Loading...</small>
	</div>);
}