import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { useNavigate } from "react-router-dom";
import {useContext, useEffect, useState, useRef} from 'react';
import AppContext from "../provider/AppContext.jsx";
import {base_url, google_recaptcha_key} from '../config.jsx';
import Page from '../components/Page.jsx';
import ReCAPTCHA from 'react-google-recaptcha';

export default function ForgotPW(){
	const appProvider = useContext(AppContext);
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [errorMsg, setErrorMsg] = useState(null);
	const [successMsg, setSuccessMsg] = useState(null);
	const [capSuccess, setCapSuccess] = useState(false);

	// Step management states
	const [isTokenSent, setIsTokenSent] = useState(false);
	const [tokenValidated, setTokenValidated] = useState(false);
	const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);

	// Use useState for input values
	const [usernameInput, setUsernameInput] = useState(localStorage.getItem('osremember-user') || '');
	const [codeInput, setCodeInput] = useState('');
	const [passwordInput, setPasswordInput] = useState('');
	const [confirmPasswordInput, setConfirmPasswordInput] = useState('');

	const verifiedUsername = useRef(null);
	const verifiedCode = useRef(null);

	// If already logged in, redirect to home page
	const isLoggedIn = appProvider.isLoggedIn();
	useEffect(()=>{
		if(isLoggedIn) navigate('/');
	}, [isLoggedIn, navigate]);
	if(isLoggedIn) return null;

	const forgotPw = async e => {
		e.preventDefault();
		setSuccessMsg(null);
		if(!capSuccess){
			setErrorMsg('You didn\'t pass the robot test. 🤖 beep boop.');
			return;
		}

		setLoading(true);
		setErrorMsg(null);
		let username = usernameInput;
		try{
			await appProvider.resetPassword(username);
			verifiedUsername.current = username;
		}catch(e){
			setErrorMsg(e);
			setLoading(false);
			setIsTokenSent(false);
			return;
		}
		setSuccessMsg('Check your email for a password reset token.');
		setIsTokenSent(true);
		setCodeInput('');
		setLoading(false);
	};

	const verifyEmail = async e => {
		e.preventDefault();
		setSuccessMsg(null);
		setLoading(true);
		setErrorMsg(null);

		let code = codeInput;

		if (!code) {
			console.log('verifyEmail - Code is empty, showing error.');
			setErrorMsg('Verification code cannot be empty.');
			setLoading(false);
			return;
		}

		let valid = false;
		try{
			valid = await appProvider.validatePWResetToken(verifiedUsername.current, code);
		}catch(e){
			console.error('verifyEmail - API call failed:', e);
			setErrorMsg(e);
			setLoading(false);
			setTokenValidated(false);
			return;
		}
		if(valid){
			verifiedCode.current = code;
			setSuccessMsg('Token validated! Choose a new password.');
			setTokenValidated(true);
			setPasswordInput('');
			setConfirmPasswordInput('');
			setLoading(false);
		}else{
			setErrorMsg("Invalid token.");
			setLoading(false);
			setTokenValidated(false);
		}
	};

	const setNewPassword = async e => {
		e.preventDefault();
		setSuccessMsg(null);

		if(passwordInput !== confirmPasswordInput){
			setErrorMsg('Your passwords don\'t match.');
			return;
		}

		setLoading(true);
		setErrorMsg(null);
		let password = passwordInput;
		try{
			await appProvider.resetPWFromToken(verifiedUsername.current, verifiedCode.current, password);
		}catch(e){
			setErrorMsg(e);
			setLoading(false);
			setPasswordResetSuccess(false);
			return;
		}
		setSuccessMsg('Password has been updated! You may log in now.');
		setPasswordResetSuccess(true);
		setLoading(false);
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

	let body;
	if(!isTokenSent){ // Step 1: Request reset
		body = (
			<form onSubmit={forgotPw}>
				<p><b>Password Reset</b></p>
				{errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
				{successMsg && <div className="alert alert-success">{successMsg}</div>}
				<div className="form-floating mb-1">
					<input
						type="text"
						value={usernameInput}
						onChange={e => setUsernameInput(e.target.value)}
						className="form-control"
						disabled={loading}
						id="usernameOrEmail"
					/>
					<label htmlFor="usernameOrEmail">Username or Email</label>
				</div>
				<ReCAPTCHA sitekey={google_recaptcha_key} onChange={onCaptchaSuccess} onErrored={onCaptchaError} onExpired={onCaptchaExpired} />
				<button className="w-100 btn btn-lg btn-primary mt-1" type="submit" disabled={loading}>
					{loading ? <FontAwesomeIcon icon={faSpinner} className="fa-spin-pulse" /> : `Reset Password`}
				</button>
			</form>
		);
	}else if(!tokenValidated){ // Step 2: Enter code
		body = (
			<form onSubmit={verifyEmail}>
				<p><b>Verify Email to Reset Password</b></p>
				{errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
				{successMsg && <div className="alert alert-success">{successMsg}</div>}
				<div className="form-floating mb-1">
					<input
						type="text"
						value={codeInput}
						onChange={e => {
							setCodeInput(e.target.value);
						}}
						className="form-control"
						disabled={loading}
						id="verificationCode"
					/>
					<label htmlFor="verificationCode">Verification Code</label>
				</div>
				<button className="w-100 btn btn-lg btn-primary mt-1" type="submit" disabled={loading}>
					{loading ? <FontAwesomeIcon icon={faSpinner} className="fa-spin-pulse" /> : `Verify Email`}
				</button>
			</form>
		);
	}else if(!passwordResetSuccess){ // Step 3: Set new password
		body = (
			<form onSubmit={setNewPassword}>
				<p><b>Set New Password</b></p>
				{errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
				{successMsg && <div className="alert alert-success">{successMsg}</div>}
				<div className="form-floating mb-1">
					<input
						type="password"
						value={passwordInput}
						onChange={e => setPasswordInput(e.target.value)}
						className="form-control"
						disabled={loading}
						id="newPassword"
					/>
					<label htmlFor="newPassword">Password*</label>
					<div className="form-text text-sm">8+ characters, letters &amp; numbers, at least one special character.</div>
				</div>
				<div className="form-floating mb-1">
					<input
						type="password"
						value={confirmPasswordInput}
						onChange={e => setConfirmPasswordInput(e.target.value)}
						className="form-control"
						disabled={loading}
						id="confirmNewPassword"
					/>
					<label htmlFor="confirmNewPassword">Confirm Password*</label>
				</div>
				<button className="w-100 btn btn-lg btn-primary mt-1" type="submit" disabled={loading}>
					{loading ? <FontAwesomeIcon icon={faSpinner} className="fa-spin-pulse" /> : `Update Password`}
				</button>
			</form>
		);
	}else{ // Step 4: Success message
		body = (
			<div>
				{errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
				{successMsg && <div className="alert alert-success">{successMsg}</div>}
			</div>
		);
	}

	let navbar_logo = appProvider.getProp('vanity_logo');
	let logo_url = navbar_logo 
		? `https://rockwell.ourtownamerica.com/intra/api/ordersys/serve-logo.php?img=${navbar_logo}&_=${new Date().getTime()}` 
		: `${base_url}assets/img/ot_house.png`;

	return (
		<Page>
			<main className="form-signup text-center">
				<img className="mb-4 img-fluid" src={logo_url} />
				{body}
				<button className="w-100 btn btn-lg btn-outline-primary mt-3" type="button" onClick={e=>nav(e,'/login')}>Sign In</button>
				{appProvider.canHaveSubs() && <button className="w-100 btn btn-lg btn-outline-primary mt-1" type="button" onClick={e=>nav(e,'/signup')}>Sign up</button>}
			</main>
		</Page>
	);
}
