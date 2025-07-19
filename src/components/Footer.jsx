import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faEnvelope, faDisplay } from '@fortawesome/free-solid-svg-icons';
import pkg from '/package.json';

export default function Footer(){
	return (<div className='footer bg-light otospage-footer'>
		<div className="container" style={{margin: '0 auto'}}>
			<div className='row p-4'>
				<div className='col-md-6'>
					<div><b>Contact Us!</b></div>
					<div><a className='no-breaky' href='https://www.ourtownamerica.com'><FontAwesomeIcon icon={faDisplay} /> www.OurTownAmerica.com</a></div>
					<div><a className='no-breaky' href='tel:+18004978360'><FontAwesomeIcon icon={faPhone} /> (800) 497-8360</a></div>
					<div><a className='no-breaky' href='mailto:customerservice@ourtownamerica.com'><FontAwesomeIcon icon={faEnvelope} /> customerservice@ourtownamerica.com</a></div>
				</div>
				<div className='col-md-6'>
					<div className='text-md-end'>OTA Order System v.{pkg.version}</div>
					<div className='text-md-end'>© {new Date().getFullYear()} Our Town America, Inc.</div>
				</div>
			</div>
		</div>
	</div>);
}