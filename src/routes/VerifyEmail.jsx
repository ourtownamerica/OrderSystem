import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { useNavigate } from "react-router-dom";
import {useContext, useEffect, useState, useRef} from 'react';
import AppContext from "../provider/AppContext.jsx";
import {base_url, google_recaptcha_key} from '../config.jsx';
import Page from '../components/Page.jsx';
import ReCAPTCHA from 'react-google-recaptcha';

export default function VerifyEmail(){
	const appProvider = useContext(AppContext);
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [errorMsg, setErrorMsg] = useState(null);
	const [successMsg, setSuccessMsg] = useState(null);

	const codeRef = useRef();

	// If already logged in, redirect to home page
	const isLoggedIn = appProvider.isLoggedIn();
	useEffect(()=>{
		if(isLoggedIn) navigate('/');
	}, [isLoggedIn, navigate]);
	if(isLoggedIn) return null;

	const verifyEmail = async e => {
		e.preventDefault();

		const scrollToTop = () => setTimeout(()=>{
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}, 10);

		setLoading(true);
		setErrorMsg(null);

		let code = codeRef.current.value;

		try{
			await appProvider.verifyEmail(code);
		}catch(e){
			setErrorMsg(e.message || e);
			setLoading(false);
			scrollToTop();
			return;
		}
		setSuccessMsg('Your email has been verified! You will be redirected in 5 seconds.');
		setLoading(false);
		scrollToTop();
		setTimeout(()=>navigate('/login'), 5000);
	};

	const nav = (e, path) => {
		e.preventDefault();
		navigate(path);
	};

	return (<Page>
		<main className="form-signup">
			<img className="mb-2 img-fluid d-block mx-auto small-main-logo" src={`${base_url}assets/img/ot_house.png`} />

			<p className='text-center'><b>Active your Account</b></p>

			{errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
			{successMsg && <div className="alert alert-success">{successMsg}</div>}

			<form onSubmit={verifyEmail} className={successMsg === null ? '' : 'd-none'}>

				<small><b>Verify your email</b></small>

				<div className="form-floating mb-1">
					<input type="text" className="form-control" ref={codeRef} disabled={loading} />
					<label htmlFor={codeRef.current?.id||''}>Verification Code*</label>
					<div className="form-text text-sm">The 6-digit code from the welcome email.</div>
				</div>

				<button className="w-100 btn btn-lg btn-primary mt-1" type="submit" disabled={loading}>{loading ? <FontAwesomeIcon icon={faSpinner} className="fa-spin-pulse" /> : `Verify Email`}</button>

			</form>

			<button className="w-100 btn btn-lg btn-outline-primary mt-3" type="button" onClick={e=>nav(e,'/login')}>Sign In</button>
			<button className="w-100 btn btn-lg btn-outline-primary mt-1" type="button" onClick={e=>nav(e,'/forgotpw')}>Forgot Password</button>
		</main>
	</Page>);
}