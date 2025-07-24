import React, { useEffect, useRef, useState, useContext, useCallback } from 'react';
import { createPortal } from 'react-dom';
import AppContext from "../provider/AppContext.jsx";
import FI from '../libs/file-input.min.js';
import scaleLogoImg from '../libs/scaleLogoImg.js';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from '@fortawesome/free-solid-svg-icons';
import { base_url } from '../config.jsx';

export default function PaymentModal({ onClose, onSuccess }){
	const appProvider = useContext(AppContext);

	const [isVisible, setIsVisible] = useState(false);
	const elRef = useRef(null);

	const [loading, setLoading] = useState(false);
	const [errorMsg, setErrorMsg] = useState(null);
	const [successMsg, setSuccessMsg] = useState(null);

	const [firstname, setFirstname] = useState('');
	const [lastname, setLastname] = useState('');
	const [address1, setAddress1] = useState('');
	const [city, setCity] = useState('');
	const [state, setState] = useState('');
	const [zip, setZip] = useState('');

	const [cardno, setCardno] = useState('');
	const [expdate, setExpdate] = useState('');
	const [cvv, setCvv] = useState('');

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
		// Save card info

		setLoading(true);
		setErrorMsg(null);

		try{
			let pmt = await appProvider.createPaymentAcct(firstname, lastname, address1, city, state, zip, cardno, expdate, cvv);
			setSuccessMsg('Payment Method created!');
			setLoading(false);

			onSuccess(pmt);
		}catch(e){
			setErrorMsg(e);
			setLoading(false);
		}
	};

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
							<h5 className="modal-title" id="modal-title">Add Payment Method</h5>
							<button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
						</div>
						<div className="modal-body">
							
							{errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
							{successMsg && <div className="alert alert-success">{successMsg}</div>}

							<h5>Card Info</h5>

							<div className='row'>
								<div className="col-md-12">
									<div className="mb-3">
										<label className="form-label">Card Number*</label>
										<input type="password" className="form-control" value={cardno} onChange={e => setCardno(e.target.value)} disabled={loading} />
									</div>
								</div>
							</div>

							<div className='row'>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Expiration Date*</label>
										<select className="form-select" value={expdate} onChange={e => setExpdate(e.target.value)} disabled={loading}>
											<option value=''>Select expiration date</option>
											{Array(18).fill(1).map((v,i)=>{
												let date = new Date();
												date.setMonth(date.getMonth()+i);
												let monthIdx = date.getMonth();
												let year = date.getFullYear();
												let value = `${year}-${`${monthIdx+1}`.padStart(2,'0')}`;
												return <option value={value} key={value}>{value}</option>;
											})}
										</select>
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Security Code*</label>
										<input type="password" className="form-control" value={cvv} onChange={e => setCvv(e.target.value)} disabled={loading} />
									</div>
								</div>
							</div>

							<h5>Name on Card</h5>

							<div className='row'>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">First Name*</label>
										<input type="text" className="form-control" value={firstname} onChange={e => setFirstname(e.target.value)} disabled={loading} />
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Last Name*</label>
										<input type="text" className="form-control" value={lastname} onChange={e => setLastname(e.target.value)} disabled={loading} />
									</div>
								</div>
							</div>

							<h5>Billing Address</h5>

							<div className='row'>
								<div className="col-md-12">
									<div className="mb-3">
										<label className="form-label">Address*</label>
										<input type="text" className="form-control" value={address1} onChange={e => setAddress1(e.target.value)} disabled={loading} />
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