import { useNavigate } from "react-router-dom";
import {useCallback, useContext, useEffect, useState} from 'react';
import AppContext from "../provider/AppContext.jsx";
import { faUser, faImage } from '@fortawesome/free-solid-svg-icons';
import PageHeader from "../components/PageHeader.jsx";
import FI from '../libs/file-input.min.js';
import scaleLogoImg from '../libs/scaleLogoImg.js';
import Page from "../components/Page.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { base_url } from '../config.jsx';

export default function Profile(){
	const appProvider = useContext(AppContext);
	const navigate = useNavigate();

	const [loading, setLoading] = useState(false);
	const [errorMsg, setErrorMsg] = useState(null);
	const [successMsg, setSuccessMsg] = useState(null);

	const [username, setUsername] = useState(appProvider.getProp('jps_username') ?? '');
	const [firstname, setFirstname] = useState(appProvider.getProp('first_name') ?? '');
	const [lastname, setLastname] = useState(appProvider.getProp('last_name') ?? '');
	const [email, setEmail] = useState(appProvider.getProp('email') ?? '');
	const [slug, setSlug] = useState(appProvider.getProp('slug') ?? '');
	const [title, setTitle] = useState(appProvider.getProp('job_title') ?? '');
	const [company, setCompany] = useState(appProvider.getProp('company_name') ?? '');
	const [address1, setAddress1] = useState(appProvider.getProp('address1') ?? '');
	const [address2, setAddress2] = useState(appProvider.getProp('address2') ?? '');
	const [city, setCity] = useState(appProvider.getProp('city') ?? '');
	const [state, setState] = useState(appProvider.getProp('state') ?? '');
	const [zip, setZip] = useState(appProvider.getProp('zip') ?? '');
	const [logo, setLogo] = useState(appProvider.getLogoURL());

	let logoDivRef = useCallback(node=>{
		if(!node) return;
		new FI({accept: ["png", "jpg"]})
			.openOnClick(node.querySelector('button')) 
			.onFileSelect(async function(){ 
				if(loading) return;
				setLoading(true);
				const file = this.getFile();
				this.clearFiles();
				let blob = await scaleLogoImg(file, true);
				await appProvider.uploadLogo(blob);
				setLogo(appProvider.getLogoURL());
				setLoading(false);
			});
	}, [loading]);

	// Enforce Login
	const isLoggedIn = appProvider.isLoggedIn();
	useEffect(()=>{
		if(!isLoggedIn) navigate('/login');
	}, [isLoggedIn, navigate]);
	if(!isLoggedIn) return null;

	const updateUser = async e => {
		e.preventDefault();
		if(loading) return;
		setErrorMsg(null);
		setSuccessMsg(null);
		try{
			await appProvider.updateProfile(username, firstname, lastname, slug, title, company, address1, address2, city, state, zip);
			setSuccessMsg('Account updated! ');
		}catch(e){
			setErrorMsg(e);
		}
		setLoading(false);
	};

	const sanitizeSlug = slug => {
		slug = slug.toLowerCase();
		slug = slug.replace(/\s+/g, ' ');
		slug = slug.replace(/ /g, '-');
		slug = slug.replace(/[^a-zA-Z0-9_-]/g, '');
		setSlug(slug);
	};

	return (<Page>
		<div>
			<PageHeader icon={faUser} title='My Account' />
			
			{errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
			{successMsg && <div className="alert alert-success">{successMsg}</div>}

			<h4>Company Logo</h4>
			<div className='mb-3' ref={logoDivRef}>
				<img src={logo} className="img-thumbnail d-block" />
				<button className='btn btn-primary mt-2 btn-sm'><FontAwesomeIcon icon={faImage} disabled={loading} /> Choose a logo</button>
			</div>

			<form onSubmit={updateUser}>

				<h4 className='mt-3'>Identifiers</h4>
				<div className="mb-3">
					<label className="form-label">Company Name</label>
					<input type="text" className="form-control" value={company} onChange={e => setCompany(e.target.value)} disabled={loading} />
				</div>
				<div className='row'>
					<div className="col-lg-6">
						<div className="mb-3">
							<label className="form-label">Username</label>
							<input type="text" className="form-control" value={username} onChange={e => setUsername(e.target.value)} disabled={loading} />
						</div>
					</div>
					<div className="col-lg-6">
						<div className="mb-3">
							<label className="form-label">Email</label>
							<input type="email" className="form-control" value={email} disabled={true} />
						</div>
					</div>
				</div>

				{appProvider.getProp('subaccounts_allowed') && (<>
					<h4 className='mt-3'>Vanity URL</h4>
					<div className="mb-3">
						<div className="input-group">
							<span className="input-group-text">{base_url}c/</span>
							<input type="text" className="form-control" value={slug} onChange={e => sanitizeSlug(e.target.value)} disabled={loading} />
						</div>
						<div className="form-text">This custom URL will display your logo and company name and can be used to login to your account or your child accounts.</div>
					</div>
				</>)}

				<h4 className='mt-3'>Contact Info</h4>
				<div className='row'>
					<div className="col-lg-4">
						<div className="mb-3">
							<label className="form-label">First Name</label>
							<input type="text" className="form-control" value={firstname} onChange={e => setFirstname(e.target.value)} disabled={loading} />
						</div>
					</div>
					<div className="col-lg-4">
						<div className="mb-3">
							<label className="form-label">Last Name</label>
							<input type="text" className="form-control" value={lastname} onChange={e => setLastname(e.target.value)} disabled={loading} />
						</div>
					</div>
					<div className="col-lg-4">
						<div className="mb-3">
							<label className="form-label">Title</label>
							<input type="text" className="form-control" value={title} onChange={e => setTitle(e.target.value)} disabled={loading} />
						</div>
					</div>
				</div>
				<div className='row'>
					<div className="col-lg-6">
						<div className="mb-3">
							<label className="form-label">Address</label>
							<input type="text" className="form-control" value={address1} onChange={e => setAddress1(e.target.value)} disabled={loading} />
						</div>
					</div>
					<div className="col-lg-6">
						<div className="mb-3">
							<label className="form-label">Suite/Unit</label>
							<input type="text" className="form-control" value={address2} onChange={e => setAddress2(e.target.value)} disabled={loading} />
						</div>
					</div>
				</div>
				<div className='row'>
					<div className="col-lg-4">
						<div className="mb-3">
							<label className="form-label">City</label>
							<input type="text" className="form-control" value={city} onChange={e => setCity(e.target.value)} disabled={loading} />
						</div>
					</div>
					<div className="col-lg-4">
						<div className="mb-3">
							<label className="form-label">State</label>
							<input type="text" className="form-control" value={state} onChange={e => setState(e.target.value)} disabled={loading} />
						</div>
					</div>
					<div className="col-lg-4">
						<div className="mb-3">
							<label className="form-label">Zip</label>
							<input type="text" className="form-control" value={zip} onChange={e => setZip(e.target.value)} disabled={loading} />
						</div>
					</div>
				</div>

				<button className='btn btn-primary' type='submit'>Save Changes</button>

			</form>
			
		</div>
	</Page>);
}