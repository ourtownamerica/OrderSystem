import { useNavigate } from "react-router-dom";
import {useContext, useEffect} from 'react';
import AppContext from "../provider/AppContext.jsx";
import { faHouse } from '@fortawesome/free-solid-svg-icons';
import PageHeader from "../components/PageHeader.jsx";

import Page from "../components/Page.jsx";

export default function Home(){
	const appProvider = useContext(AppContext);
	const navigate = useNavigate();

	// Enforce Login
	const isLoggedIn = appProvider.isLoggedIn();
	useEffect(()=>{
		if(!isLoggedIn) navigate('/login');
	}, [isLoggedIn, navigate]);
	if(!isLoggedIn) return null;

	return (<Page>
		<div>
			<PageHeader icon={faHouse} title='Home' />
			<div className='row'>
				<div className="col-lg-4 d-flex text-center">
					
				</div>
				<div className="col-lg-4 d-flex text-center">
					<p>Dashboard Stuff Here</p>
				</div>
				<div className="col-lg-4 d-flex text-center">
					
				</div>
			</div>
		</div>
	</Page>);
}