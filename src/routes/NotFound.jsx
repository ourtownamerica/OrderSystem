import Page from '../components/Page.jsx';
import {base_url} from '../config.jsx';

export default function NotFound(){
	return (<Page>
		<div className='text-center'>
			<img className="mb-4 img-fluid form-signup" src={`${base_url}assets/img/ot_house.png`} />
			<h2>404: That page doesn't exist.</h2>
		</div>
	</Page>);
}