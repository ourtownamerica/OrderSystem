import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { useNavigate } from "react-router-dom";
import {useContext, useEffect, useState, useRef} from 'react';
import AppContext from "../provider/AppContext.jsx";
import {base_url, google_recaptcha_key} from '../config.jsx';
import Page from '../components/Page.jsx';
import Alert from '../components/Alert.jsx';
import ReCAPTCHA from 'react-google-recaptcha';

export default function SignUp(){
	const appProvider = useContext(AppContext);
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [errorMsg, setErrorMsg] = useState(null);
	const [successMsg, setSuccessMsg] = useState(null);
	const [capSuccess, setCapSuccess] = useState(false);
	const [showTnCAlert, setShowTnCAlert] = useState(false);
	const [showPPAlert, setShowPPAlert] = useState(false);

	const usernameRef = useRef();
	const emailRef = useRef();
	const fnameRef = useRef();
	const lnameRef = useRef();
	const passwordRef = useRef();
	const confirmPasswordRef = useRef();
	const phoneRef = useRef();
	const titleRef = useRef();
	const companyRef = useRef();
	const cbRef = useRef();

	// If already logged in, redirect to home page
	const isLoggedIn = appProvider.isLoggedIn();
	useEffect(()=>{
		if(isLoggedIn) navigate('/');
	}, [isLoggedIn, navigate]);
	if(isLoggedIn) return null;

	const signUp = async e => {
		e.preventDefault();

		const scrollToTop = () => setTimeout(()=>{
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}, 10);

		if(!capSuccess){
			setErrorMsg('You didn\'t pass the robot test. 🤖 beep boop.');
			scrollToTop();
			return;
		}

		if(!cbRef.current.checked){
			setErrorMsg('You must agree to the Terms and Conditions before continuing.');
			scrollToTop();
			return;
		}

		setLoading(true);
		setErrorMsg(null);

		let username = usernameRef.current.value;
		let email = emailRef.current.value;
		let firstname = fnameRef.current.value;
		let lastname = lnameRef.current.value;
		let password = passwordRef.current.value;
		let confirmPassword = confirmPasswordRef.current.value;
		let phone = phoneRef.current.value;
		let title = titleRef.current.value;
		let company = companyRef.current.value;

		if(password !== confirmPassword){
			setErrorMsg('Your passwords do not match.');
			setLoading(false);
			scrollToTop();
			return;
		}

		try{
			await appProvider.createAccount(username, email, firstname, lastname, password, phone, title, company);
		}catch(e){
			setErrorMsg(e);
			setLoading(false);
			scrollToTop();
			return;
		}
		setSuccessMsg('Your account has been created! You will be redirected in 5 seconds.');
		setLoading(false);
		scrollToTop();
		setTimeout(()=>{
			navigate('/verifyemail');
		}, 5000);
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

	return (<Page>
		<main className="form-signup">
			<img className="mb-2 img-fluid d-block mx-auto small-main-logo" src={`${base_url}assets/img/ot_house.png`} />

			<p className='text-center'><b>Create New Account</b></p>

			{errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
			{successMsg && <div className="alert alert-success">{successMsg}</div>}

			<form onSubmit={signUp} className={successMsg === null ? '' : 'd-none'}>

				<small><b>Chooose a username:</b></small>

				<div className="form-floating mb-1">
					<input type="text" className="form-control" ref={usernameRef} disabled={loading} />
					<label htmlFor={usernameRef.current?.id||''}>Username*</label>
					<div className="form-text text-sm">3-30 characters, letters, numbers, and underscores only.</div>
				</div>

				<small className='mt-3'><b>Tell us about you:</b></small>

				<div className="form-floating mb-1">
					<input type="text" className="form-control" ref={fnameRef} disabled={loading} />
					<label htmlFor={fnameRef.current?.id||''}>First Name*</label>
				</div>

				<div className="form-floating mb-1">
					<input type="text" className="form-control" ref={lnameRef} disabled={loading} />
					<label htmlFor={lnameRef.current?.id||''}>Last Name*</label>
				</div>

				<div className="form-floating mb-1">
					<input type="email" className="form-control" ref={emailRef} disabled={loading} />
					<label htmlFor={emailRef.current?.id||''}>Email Address*</label>
				</div>

				<div className="form-floating mb-1">
					<input type="text" className="form-control" ref={phoneRef} disabled={loading} />
					<label htmlFor={phoneRef.current?.id||''}>Phone Number</label>
				</div>

				<div className="form-floating mb-1">
					<input type="text" className="form-control" ref={titleRef} disabled={loading} />
					<label htmlFor={titleRef.current?.id||''}>Job Title</label>
				</div>

				<div className="form-floating mb-1">
					<input type="text" className="form-control" ref={companyRef} disabled={loading} />
					<label htmlFor={companyRef.current?.id||''}>Company Name</label>
				</div>

				<small className='mt-3'><b>Choose a password:</b></small>

				<div className="form-floating mb-1">
					<input type="password" className="form-control" ref={passwordRef} disabled={loading} />
					<label htmlFor={passwordRef.current?.id||''}>Password*</label>
					<div className="form-text text-sm">8+ characters, letters &amp; numbers, at least one special character.</div>
				</div>

				<div className="form-floating mb-1">
					<input type="password" className="form-control" ref={confirmPasswordRef} disabled={loading} />
					<label htmlFor={confirmPasswordRef.current?.id||''}>Confirm Password*</label>
				</div>

				<div className="my-3 form-check">
					<input type="checkbox" className="form-check-input" ref={cbRef} />
					<label className="form-check-label">I agree to the <a href='#' onClick={e=>{e.preventDefault(); setShowTnCAlert(true);}}>Terms and Conditions</a> and <a href='#' onClick={e=>{e.preventDefault(); setShowPPAlert(true);}}>Privacy Policy</a> of the Job Order Processing System. </label>
				</div>

				
				<ReCAPTCHA sitekey={google_recaptcha_key} onChange={onCaptchaSuccess} onErrored={onCaptchaError} onExpired={onCaptchaExpired} />
				<button className="w-100 btn btn-lg btn-primary mt-1" type="submit" disabled={loading}>{loading ? <FontAwesomeIcon icon={faSpinner} className="fa-spin-pulse" /> : `Create Account`}</button>

			</form>

			<button className="w-100 btn btn-lg btn-outline-primary mt-3" type="button" onClick={e=>nav(e,'/login')}>Sign In</button>
			<button className="w-100 btn btn-lg btn-outline-primary mt-1" type="button" onClick={e=>nav(e,'/forgotpw')}>Forgot Password</button>
		</main>
		{showPPAlert && (
			<Alert title='Privacy Policy' onClose={()=>setShowPPAlert(false)}>
				<p>We protect your data and only use it for order processing and communication. We never sell your information to third parties.</p>
			</Alert>
		)}
		{showTnCAlert && (<Alert title='Terms &amp; Conditions' onClose={()=>setShowTnCAlert(false)}>
			<div className="effective-date mb-3">
				<strong>Effective Date:</strong> June 2025
			</div>
			<div className="highlight-warning">
				<strong>IMPORTANT:</strong> BY ACCEPTING THIS AGREEMENT, CHANNEL PARTNER
				ACKNOWLEDGES READ AND UNDERSTANDS ALL OF THE TERMS AND CONDITIONS OF THIS
				AGREEMENT, AND AGREES TO BE LEGALLY BOUND BY THEM.
			</div>
			<p>
				These TERMS &amp; CONDITIONS (the "Agreement") are an agreement between Our
				Town America, a Franchising Corporation, a Florida corporation ("OTA"), and
				the customer specified on the ordering documents (the "Channel
				Partner/Client/Client"/you/your) used by customer for placing its order (the
				"Order Form"), and contains the terms and conditions that govern Channel
				Partners purchase and receipt of OTA's products and services as set forth in
				the Order Form.
			</p>
			<p>
				This Agreement takes effect when Channel Partner clicks an "Accept,"
				"Agree," "Continue," or similar check box or button presented with this
				Agreement. THE INDIVIDUAL ENTERING INTO THIS AGREEMENT ON BEHALF OF THE
				CLIENT REPRESENTS TO OTA THAT HE/SHE HAS LEGAL AUTHORITY TO BIND THE CLIENT.
			</p>
			<p>
				OTA provides to local businesses direct mail marketing materials and
				services that promote the local businesses to individuals and families that
				are new movers or that have indicated a change of address using products and
				services, including but not limited to postcard and digital advertising for
				direct mail advertising and marketing the businesses.
			</p>
			<h2>1. SERVICES AND PRODUCTS</h2>
			<h3>A. NEW MOVER MARKETING PROGRAM</h3>
			<p>
				Although OTA takes great measures to produce the best list of new customers
				available, errors will occur. If documented errors in any one mailing exceed
				8% of the mailed names, the local franchisee of OTA (the "Company") will
				issue a credit for the amount exceeding 8%. OTA retains ownership of all
				names derived from mailing or barcode scanning.
			</p>
			<p>
				A Channel Partner is invoiced upon receipt by the Company of the names of
				the current change of address counts, and payment is due upon Channel
				Partners receipt of the invoice. Exclusivity is per Household, based on the
				features chosen within this Agreement. Unused Households of the selected
				area not fully selected may be sold to the same OTIC Code noted above. This
				Agreement shall be binding on Channel Partner successors and assigns.
			</p>
			<h3>B. POSTCARD</h3>
			<p>
				The backside template (shown on the Order Form) reflects current USPS Postal
				Requirements and these requirements allow for the proper automated handling
				of your postcards. Please make sure your backside layout complies with this
				template if mailing your postcards.
			</p>
			<h3>C. DIGITAL MARKETING</h3>
			<p>
				You shall provide assistance, technical information and decisions to OTA, as
				reasonably required by OTA in sufficient time to facilitate the execution of
				marketing efforts. You agree to work closely with OTA to provide regular
				information and feedback so OTA can create fresh content and make
				adjustments to the marketing efforts accordingly.
			</p>
			<p>
				This assistance includes providing necessary login information and passwords
				to access social media, analytics, hosting, domains, and other third-party
				accounts necessary for OTA to carry out marketing efforts. OTA will provide
				social media marketing, pay per click, retargeting, and other types of
				digital ads across multiple platforms including Meta, Instagram, Google,
				YouTube and other sites.
			</p>
			<h4>i. Client Data</h4>
			<p>
				You retain ownership in your data entered in connection with the Services
				("Client Data"). Channel Partner grants OTA a non-exclusive license to
				store, record, transmit, maintain, display, use, post, distribute and modify
				Channel Partner's Data for the purpose to providing the Services in
				accordance with this Agreement.
			</p>
			<p>
				OTA will not share Channel Partner Data with any business other than in the
				course of securing online advertising and marketing services on your behalf.
				OTA has the right to place information pertaining to your business on any of
				the social media such as those listed above, and authorize OTA develop
				content based on information or material provided by you or your designees
				and collected by OTA including copy, form, size, text, graphics, names,
				addresses, phone numbers, URLs, logos, trade names, trademarks, service
				marks, endorsements, photographs or likenesses. Further, You represent that
				the material and information provided to OTA is truthful, not misleading,
				and that you have the authority to represent this product and service
				information to OTA.
			</p>
			<h4>ii. Data Protection</h4>
			<p>
				OTA will treat Channel Partner Data as confidential information and will
				take reasonable commercial efforts to secure and protect Sponsor/Client Data
				against unauthorized access or disclosure and will not use Sponsor/Client
				Data except as permitted in this Agreement and our{" "}
				<a href="https://www.ourtownamerica.com/privacy-policy/" target="_blank">
					Privacy Policy
				</a>
				.
			</p>
			<p>
				Except for Channel Partner Data, all content including new customer
				information and features of the services are OTA's confidential and
				proprietary information (collectively, "Confidential Information"). Channel
				Partner may use such Confidential Information only in connection with its
				use of the Services as permitted under this Agreement. Channel Partner will
				not disclose Confidential Information during the term of this Agreement or
				any time following the end of such term. Channel Partner will take all
				reasonable measures to avoid disclosure, dissemination, or unauthorized use
				of Confidential Information, including, at a minimum, those measures Channel
				Partner takes to protect its own most confidential information.
			</p>
			<h2>2. ACCURACY OF PRODUCTS</h2>
			<h3>A. LAYOUT</h3>
			<p>
				<strong>
					You are 100% responsible for the accuracy of your layouts submitted to
					OTA.
				</strong>{" "}
				Please proofread all layouts carefully. All layouts assembled by OTA will
				have{" "}
				<a href="http://www.ourtownamerica.com" target="_blank">
					www.ourtownamerica.com
				</a>{" "}
				printed in 5pt. font on the backside of the card.
			</p>
			<p>
				OTA reserves the right to refuse to print any material that OTA determines,
				in its sole discretion, is immoral, illegal, or inappropriate for
				distribution in the United States Postal Service mail stream. If your
				material is deemed unacceptable, you will be notified promptly and permitted
				to change the content or layout to fit our requirements.
			</p>
			<h3>B. COLOR</h3>
			<p>
				OTA will reproduce color from submitted photos or digital layouts as closely
				and accurately as possible. OTA accepts no responsibility for color
				variations between submitted images and the artwork or product they
				represent. All colors contained within any CMYK digital file will be
				converted to OTA's RGB color space, which may cause the CMYK colors to
				change due to color space differences.
			</p>
			<p>
				The colors on the printed cards may differ from what you see displayed when
				viewing your layout via OTA's online final approval process. The online
				proof only presents the design layout, text accuracy, image proportion and
				placement, but not color or density.
			</p>
			<h2>3. PAYMENT</h2>
			<p>
				The fees for OTA Products and Services, which include the cost of
				processing, printing, shipping and/or mailing, and any other charges
				applicable, are due and payable together with the submission of an order.
				The company reserves the right to automatically, without prior notice, pass
				along to Channel Partner all postal and production rate increases.
			</p>
			<div className="highlight-warning">
				<strong>Payment Terms:</strong> OTA requires 100% payment one week before
				mailing. Orders will be mailed once payment has been received.
			</div>
			<p>
				OTA will invoice Channel Partner for the fees. Channel Partner is
				responsible for providing complete and accurate billing and contact
				information about notifying OTA of any changes to such information. If the
				Channel Partner wishes to dispute any fees contained in an invoice, They
				must notify the OTA in writing within five (5) business days. Failure to do
				so will result in the invoice being deemed correct, and the Channel Partner
				will waive its right to dispute it.
			</p>
			<p>
				Any amount due to OTA which is not paid may result in non-delivery of the
				order, and unpaid amounts beyond 30 days are subject to 1.75% interest per
				month or the highest rate as allowed by law, if less, and a late fee of $20
				per month. Sponsor/Clients are responsible for all related collection costs,
				legal fees and interest.
			</p>
			<h2>4. SALES TAX POLICY</h2>
			<p>OTA is required to collect sales tax on purchases shipped to Florida.</p>
			<h2>5. REFUNDS &amp; CANCELLATION</h2>
			<div className="highlight-warning">
				<strong>No Refunds:</strong> No refunds of any nature will be granted once
				OTA begins your order. Additionally, no partial refunds will be provided for
				work not completed and design and set up fees may still apply and be
				charged.
			</div>
			<p>
				All refunds, due to an overpayment on a particular account, are available
				upon the Channel Partner's reasonable request.
			</p>
			<h2>6. PRODUCTION TIME &amp; DELIVERY</h2>
			<p>
				Quoted Production Times start only after OTA receives final approval of your
				layout and full payment. All correspondence regarding the order must include
				the order number (in the subject line of an email) to avoid any delays in
				production.
			</p>
			<p>
				Expected delivery date and Production Times are not guaranteed. Your order
				may arrive late due to unforeseen delays in delivery service, natural
				disaster, the breakdown of equipment, bad weather, etc. OTA is not liable
				for damage caused by any service carrier.
			</p>
			<h2>7. TERM; TERMINATION</h2>
			<p>
				The initial term of this Agreement commences on the Effective Date and
				continues as described in the applicable Order Form. If Channel Partner
				materially breaches any of its duties or obligations in this Agreement and
				does not correct such default within ten (10) days of the date the Company
				sends written notice thereof (by mail, electronic mail, or fax), this
				Agreement shall terminate and all amounts due for the remainder of the
				current term shall be immediately due and payable.
			</p>
			<h2>8. INDEMNIFICATION, DAMAGES</h2>
			<p>
				You agree to indemnify and hold OTA and its parent companies, subsidiaries,
				affiliates, officers, directors, franchisees employees and independent
				contractors harmless from any claim, demand, damages, liability, costs and
				expenses including attorneys' fees, made by any third party due to or
				arising out of any third party claim concerning:
			</p>
			<ul>
				<li>
					That the printed work violates any copyright, trademark, intellectual
					property, proprietary or privacy right of any person or entity; or
				</li>
				<li>
					Channel Partners breach of this Agreement or violation of applicable law.
				</li>
			</ul>
			<h2>9. WARRANTY DISCLAIMERS</h2>
			<div className="highlight-warning">
				<p>
					<strong>
						THE PRODUCTS AND SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE."
					</strong>{" "}
					OTA MAKES NO REPRESENTATIONS OR WARRANTIES OF ANY KIND, WHETHER EXPRESS,
					IMPLIED, STATUTORY OR OTHERWISE REGARDING THE PRODUCTS AND SERVICES,
					INCLUDING WITHOUT LIMITATION ANY WARRANTY THAT THE PRODUCTS OR SERVICES
					WILL MEET CHANNEL PARTNER OR ANY LEGAL REQUIREMENTS.
				</p>
			</div>
			<p>
				OTA DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WITHOUT
				LIMITATION, ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
				PARTICULAR PURPOSE, NON-INFRINGEMENT, SATISFACTORY QUALITY, OR QUIET
				ENJOYMENT.
			</p>
			<h2>10. LIMITATIONS OF LIABILITY</h2>
			<div className="highlight-warning">
				<p>
					<strong>Important Limitation:</strong> We are NOT responsible, financially
					or otherwise for loss or damage to customer supplied images or artwork.
					The liability of OTA shall not be greater than the total amount of fees
					payable by customer to OTA for its products and services.
				</p>
			</div>
			<p>
				In no event will OTA be liable for any indirect, exemplary, punitive,
				special, incidental or consequential damages. THE AGGREGATE LIABILITY OF OTA
				SHALL BE LIMITED TO ACTUAL DIRECT DAMAGES NOT TO EXCEED THE FEES ACTUALLY
				RECEIVED BY OTA FROM CHANNEL PARTNER DURING THE TWELVE (12) MONTH PERIOD
				IMMEDIATELY PRECEDING THE EVENT.
			</p>
			<p>
				You agree that any claim or lawsuit relating to this Agreement must be filed
				within one (1) year of date of the alleged breach by OTA.
			</p>
			<h2>11. OWNERSHIP &amp; LIMITED USE</h2>
			<p>
				By placing an order with OTA, you represent and warrant that you have all
				necessary permission, right and authority to place an order with OTA and own
				or have properly licensed all the necessary rights to use the image(s) being
				reproduced on your products.
			</p>
			<p>
				Any images, graphics, text, lists or other materials supplied to OTA by
				Sponsor/Client will remain sole property of the Sponsor/Client. However, any
				additional materials created by OTA in the production of an order (including
				typeset layouts, color scans, fonts, high resolution digital files etc.) are
				and shall remain the sole property of OTA.
			</p>
			<p>
				Digital files of an OTA assembled layout can be obtained upon Channel
				Partner's written request and by payment of the applicable fee for such
				files. These materials will NOT be sold or traded to any other party. OTA
				reserves the right to distribute free samples of your completed cards to
				others. Lists provided by Channel Partner to OTA are your proprietary
				property and will be held with that understanding.
			</p>
			<h2>12. INDEPENDENT CONTRACTORS</h2>
			<p>
				Nothing contained in this Agreement shall be deemed to constitute either
				party being an agent, representative, partner, joint venture, or employee of
				the other party. OTA and Channel Partners are independent contractors, and
				neither party, nor any of their respective affiliates, is an agent of the
				other for any purpose or has the authority to bind the other, incur any
				liability on behalf of the other, nor to direct the employees of the other.
			</p>
			<h2>13. GOVERNING LAW; JURISDICTION</h2>
			<p>
				This Agreement shall be governed by the laws of the State where the
				Company's principal office is located. Sponsor/Client agrees to submit to
				the exclusive jurisdiction of the courts in the county where the Company's
				principal office is located.
			</p>
			<h2>14. ENTIRE AGREEMENT</h2>
			<p>
				This Agreement includes Order Forms and is the entire agreement between
				Channel Partner and OTA regarding the subject matter of this Agreement. This
				Agreement supersedes all prior or contemporaneous representations,
				understandings, agreements, or communications between Sponsor/Client and
				OTA.
			</p>
			<div className="document-version">Document Version: 4900-0463-9056, v. 3</div>
		</Alert>)}
	</Page>);
}