import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { useNavigate } from "react-router-dom";
import {useContext, useEffect, useState, useRef} from 'react';
import AppContext from "../provider/AppContext.jsx";
import {base_url, google_recaptcha_key} from '../config.jsx';
import Page from '../components/Page.jsx';
import ReCAPTCHA from 'react-google-recaptcha';

export default function Login(){
	const appProvider = useContext(AppContext);
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [errorMsg, setErrorMsg] = useState(null);
	const [capSuccess, setCapSuccess] = useState(false);

	const usernameRef = useRef();
	const passwordRef = useRef();
	const checkboxRef = useRef();

	// If already logged in, redirect to home page
	const isLoggedIn = appProvider.isLoggedIn();
	useEffect(()=>{
		if(isLoggedIn) navigate('/');
	}, [isLoggedIn, navigate]);
	if(isLoggedIn) return null;

	const doSignIn = async e => {
		e.preventDefault();

		if(!capSuccess){
			setErrorMsg('You didn\'t pass the robot test. 🤖 beep boop.');
			return;
		}

		setLoading(true);
		setErrorMsg(null);
		let username = usernameRef.current.value;
		let password = passwordRef.current.value;
		let remember = checkboxRef.current.checked;

		try{
			await appProvider.login(username, password);
		}catch(e){
			setErrorMsg(e);
			setLoading(false);
			localStorage.setItem('osremember-user', '');
			localStorage.setItem('osremember-pass', '');
			localStorage.setItem('osremember-cb', '');
			return;
		}

		localStorage.setItem('osremember-user', remember ? username : '');
		localStorage.setItem('osremember-pass', remember ? password : '');
		localStorage.setItem('osremember-cb', remember ? '1' : '');

		navigate(appProvider.getProp('verified') ? '/' : '/verifyemail');
	};

	const nav = (e, path) => {
		e.preventDefault();
		navigate(path);
	};

	const onCaptchaSuccess = ()=>{
		setCapSuccess(true);
	};

	const onCaptchaError = ()=>{
		setCapSuccess(false);
		setErrorMsg('Are you a robot?');
	};

	const onCaptchaExpired = ()=>{
		setCapSuccess(false);
	};

	let navbar_logo = appProvider.getProp('vanity_logo');
	let logo_url = navbar_logo 
		? `https://rockwell.ourtownamerica.com/intra/api/ordersys/serve-logo.php?img=${navbar_logo}&_=${new Date().getTime()}` 
		: `${base_url}assets/img/ot_house.png`;

	return (<Page>
		<main className="form-signin text-center">
			<form onSubmit={doSignIn}>
				<img className="mb-4 img-fluid" src={logo_url} />

				<p><b>Sign In</b></p>

				{errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

				<div className="form-floating">
					<input type="text" defaultValue={localStorage.getItem('osremember-user')||''} className="form-control" ref={usernameRef} placeholder="you@ourtowmanerica.com" disabled={loading} />
					<label htmlFor={usernameRef.current?.id||''}>Username or Email</label>
				</div>
				<div className="form-floating">
					<input type="password" defaultValue={localStorage.getItem('osremember-pass')||''} className="form-control" ref={passwordRef} placeholder="Password" disabled={loading} />
					<label htmlFor={passwordRef.current?.id||''}>Password</label>
				</div>

				<div className="checkbox mb-3 text-start">
					<label>
						<input type="checkbox" value="remember-me" ref={checkboxRef} defaultChecked={localStorage.getItem('osremember-cb')=='1'} /> Remember me
					</label>
				</div>

				<ReCAPTCHA sitekey={google_recaptcha_key} onChange={onCaptchaSuccess} onErrored={onCaptchaError} onExpired={onCaptchaExpired} />
				<button className="w-100 btn btn-lg btn-primary mt-1" type="submit" disabled={loading}>{loading ? <FontAwesomeIcon icon={faSpinner} className="fa-spin-pulse" /> : `Sign in`}</button>
				<button className="w-100 btn btn-lg btn-outline-primary mt-3" type="button" onClick={e=>nav(e,'/forgotpw')}>Forgot Password</button>
				{appProvider.canHaveSubs() && <button className="w-100 btn btn-lg btn-outline-primary mt-1" type="button" onClick={e=>nav(e,'/signup')}>Sign up</button>}
				
			</form>
		</main>
	</Page>);
}