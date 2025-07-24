import React, { useEffect, useRef, useState, useContext, useCallback } from 'react';
import { createPortal } from 'react-dom';
import AppContext from "../provider/AppContext.jsx";
import FI from '../libs/file-input.min.js';
import scaleLogoImg from '../libs/scaleLogoImg.js';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from '@fortawesome/free-solid-svg-icons';
import { base_url } from '../config.jsx';

export default function SubaccountModal({ onClose, onSuccess, editAccountId=null }){
	const appProvider = useContext(AppContext);

	const [isVisible, setIsVisible] = useState(false);
	const elRef = useRef(null);

	const [loading, setLoading] = useState(false);
	const [errorMsg, setErrorMsg] = useState(null);
	const [successMsg, setSuccessMsg] = useState(null);

	const [firstname, setFirstname] = useState('');
	const [lastname, setLastname] = useState('');
	const [email, setEmail] = useState('');
	const [title, setTitle] = useState('');
	const [company, setCompany] = useState('');
	const [address1, setAddress1] = useState('');
	const [address2, setAddress2] = useState('');
	const [city, setCity] = useState('');
	const [state, setState] = useState('');
	const [zip, setZip] = useState('');

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [cPassword, setCPassword] = useState('');

	const [accountId, setAccountId] = useState(editAccountId);
	const [logoBlob, setLogoBlob] = useState(null);
	const [logo, setLogo] = useState(`${base_url}assets/img/no-img-logo.png`);

	const [createLogin, setCreateLogin] = useState(false);
	const [canHaveSubs, setCanHaveSubs] = useState(false);

	useEffect(()=>{
		if(editAccountId){
			(async ()=>{
				try{
					setLoading(true);
					let details = await appProvider.getAccountDetails(editAccountId);
					setFirstname(details.first_name??'');
					setLastname(details.last_name??'');
					setEmail(details.email??'');
					setTitle(details.job_title??'');
					setCompany(details.company_name??'');
					setAddress1(details.address1??'');
					setAddress2(details.address2??'');
					setCity(details.city??'');
					setState(details.state??'');
					setZip(details.zip??'');
					setUsername(details.jps_username??'')
					setLoading(false);
					setLogo(details.logo ? `https://rockwell.ourtownamerica.com/intra/api/ordersys/serve-logo.php?img=${details.logo}&_=${new Date().getTime()}` : `${base_url}assets/img/no-img-logo.png`);
				}catch(e){
					setErrorMsg(e);
					setLoading(false);
				}
			})();
		}else{
			setCreateLogin(false);
            setCanHaveSubs(false);
            setUsername('');
            setPassword('');
            setCPassword('');
            setLogo(`${base_url}assets/img/no-img-logo.png`);
            setLogoBlob(null);
		}
	}, [editAccountId]);

	useEffect(() => {
		const div = document.createElement('div');
		elRef.current = div;
		document.body.appendChild(div);

		const showTimeout = setTimeout(() => {
			setIsVisible(true);
		}, 50);

		return () => {
			setIsVisible(false);
			const hideTimeout = setTimeout(() => {
				if (elRef.current && document.body.contains(elRef.current)) {
					document.body.removeChild(elRef.current);
				}
			}, 300);
			clearTimeout(showTimeout);
			clearTimeout(hideTimeout);
		};
	}, []);

	const onSave = async e => {
		if(password !== cPassword){
			setErrorMsg('Passwords don\'t match');
		}

		setLoading(true);
		setErrorMsg(null);

		try{
			let account;
			if(accountId){
				account = await appProvider.updateSubAccount(accountId, firstname, lastname, email, title, company, address1, address2, city, state, zip, createLogin ? username : null, createLogin ? password : null, createLogin && canHaveSubs);
				if(logoBlob) await appProvider.uploadLogo(logoBlob, accountId);
				setSuccessMsg('Account updated!');
				setLoading(false);
			}else{
				account = await appProvider.createSubAccount(firstname, lastname, email, title, company, address1, address2, city, state, zip, createLogin ? username : null, createLogin ? password : null, createLogin && canHaveSubs);
				if(logoBlob) await appProvider.uploadLogo(logoBlob, account.jps_user_id);
				setAccountId(account.jps_user_id);
				setSuccessMsg('Account created!');
				setLoading(false);
			}
			
			onSuccess(account);
		}catch(e){
			setErrorMsg(e);
			setLoading(false);
		}
		
	};

	let logoDivRef = useCallback(node=>{
		if(!node) return;
		new FI({accept: ["png", "jpg"]})
			.openOnClick(node.querySelector('button')) 
			.onFileSelect(async function(){ 
				const file = this.getFile();
				this.clearFiles();
				let blob = await scaleLogoImg(file, true);
				let dataUri = await scaleLogoImg(file, false);
				setLogoBlob(blob);
				setLogo(dataUri);
			});
	}, [loading]);

	if (!elRef.current) {
		return null;
	}

	return createPortal(
		<>
			<div className={`modal-backdrop fade ${isVisible ? 'show' : ''}`}></div>
			<div className={`modal d-block fade ${isVisible ? 'show' : ''}`} tabIndex="-1" aria-labelledby="modal-title" role="dialog" aria-modal="true">
				<div className="modal-dialog modal-dialog-centered modal-lg" role="document">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title" id="modal-title">{accountId ? 'Edit' : 'Create'} Account</h5>
							<button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
						</div>
						<div className="modal-body">
							
							{errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
							{successMsg && <div className="alert alert-success">{successMsg}</div>}

							<div className='mb-3' ref={logoDivRef}>
								<img src={logo} className="img-thumbnail d-block" />
								<button className='btn btn-primary mt-2 btn-sm'><FontAwesomeIcon icon={faImage} disabled={loading} /> Choose a logo</button>
							</div>

							<div className='row'>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Company Name</label>
										<input type="text" className="form-control" value={company} onChange={e => setCompany(e.target.value)} disabled={loading} />
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Email*</label>
										<input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
									</div>
								</div>
							</div>

							<div className='row'>
								<div className="col-md-4">
									<div className="mb-3">
										<label className="form-label">First Name*</label>
										<input type="text" className="form-control" value={firstname} onChange={e => setFirstname(e.target.value)} disabled={loading} />
									</div>
								</div>
								<div className="col-md-4">
									<div className="mb-3">
										<label className="form-label">Last Name*</label>
										<input type="text" className="form-control" value={lastname} onChange={e => setLastname(e.target.value)} disabled={loading} />
									</div>
								</div>
								<div className="col-md-4">
									<div className="mb-3">
										<label className="form-label">Title</label>
										<input type="text" className="form-control" value={title} onChange={e => setTitle(e.target.value)} disabled={loading} />
									</div>
								</div>
							</div>

							<div className='row'>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Address*</label>
										<input type="text" className="form-control" value={address1} onChange={e => setAddress1(e.target.value)} disabled={loading} />
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Suite/Unit</label>
										<input type="text" className="form-control" value={address2} onChange={e => setAddress2(e.target.value)} disabled={loading} />
									</div>
								</div>
							</div>

							<div className='row'>
								<div className="col-md-4">
									<div className="mb-3">
										<label className="form-label">City*</label>
										<input type="text" className="form-control" value={city} onChange={e => setCity(e.target.value)} disabled={loading} />
									</div>
								</div>
								<div className="col-md-4">
									<div className="mb-3">
										<label className="form-label">State*</label>
										<input type="text" className="form-control" value={state} onChange={e => setState(e.target.value)} disabled={loading} />
									</div>
								</div>
								<div className="col-md-4">
									<div className="mb-3">
										<label className="form-label">Zip*</label>
										<input type="text" className="form-control" value={zip} onChange={e => setZip(e.target.value)} disabled={loading} />
									</div>
								</div>
							</div>

							<div className="form-check">
								<input className="form-check-input" type="checkbox" checked={createLogin} onChange={e => setCreateLogin(e.target.checked)} />
								<label className="form-check-label">Create a login for this user?</label>
							</div>

							{createLogin && <div className='row'>
								<div className="col-md-4">
									<div className="mb-3">
										<label className="form-label">Username</label>
										<input type="text" className="form-control" value={username} onChange={e => setUsername(e.target.value)} disabled={loading} />
									</div>
								</div>
								<div className="col-md-4">
									<div className="mb-3">
										<label className="form-label">Password</label>
										<input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />
									</div>
								</div>
								<div className="col-md-4">
									<div className="mb-3">
										<label className="form-label">Confirm Password</label>
										<input type="password" className="form-control" value={cPassword} onChange={e => setCPassword(e.target.value)} disabled={loading} />
									</div>
								</div>
							</div>}

							{createLogin && <div className="form-check">
								<input className="form-check-input" type="checkbox" checked={canHaveSubs} onChange={e => setCanHaveSubs(e.target.checked && createLogin)} />
								<label className="form-check-label">Can this account create sub-accounts?</label>
							</div>}

						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
							<button type="button" className="btn btn-primary" onClick={onSave}>Save</button>
						</div>

					</div>
				</div>
			</div>
		</>,
		elRef.current
	);
}