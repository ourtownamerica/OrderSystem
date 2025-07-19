import Page from '../components/Page.jsx';
import {base_url} from '../config.jsx';
import {useContext} from 'react';
import AppContext from "../provider/AppContext.jsx";

export default function NotFound(){
	const appProvider = useContext(AppContext);

	let navbar_logo = appProvider.getProp('vanity_logo');
	let logo_url = navbar_logo 
		? `https://rockwell.ourtownamerica.com/intra/api/ordersys/serve-logo.php?img=${navbar_logo}&_=${new Date().getTime()}` 
		: `${base_url}assets/img/ot_house.png`;

	return (<Page>
		<div className='text-center'>
			<img className="mb-4 img-fluid form-signup" src={logo_url} />
			<h2>404: That page doesn't exist.</h2>
		</div>
	</Page>);
}