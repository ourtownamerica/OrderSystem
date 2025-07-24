import { useNavigate } from "react-router-dom";
import {useContext, useEffect, useState, useCallback} from 'react';
import AppContext from "../provider/AppContext.jsx";
import { faEnvelopesBulk, faCircleMinus } from '@fortawesome/free-solid-svg-icons';
import PageHeader from "../components/PageHeader.jsx";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Page from "../components/Page.jsx";
import AccountSelect from "../components/AccountSelect.jsx";
import SubaccountModal from "../components/SubaccountModal.jsx";
import { TerritoryChooser } from "../components/TerritoryChooser.jsx";
import OTICSelect from "../components/OTICSelect.jsx";
import { base_url } from '../config.jsx';
import PaymentSelect from "../components/PaymentSelect.jsx";
import PaymentModal from "../components/PaymentModal.jsx";
import Alert from "../components/Alert.jsx";
import TermsAndConditions from "../components/TermsAndConditions.jsx";

export default function NewOrder(){
	const appProvider = useContext(AppContext);
	const navigate = useNavigate();

	/**************************************************************************************
	 *** STATE VALUES *********************************************************************
	 **************************************************************************************/
	const [errorMsg, setErrorMsg] = useState('');
	const [showCreateAcctModal, setShowCreateAcctModal] = useState(false);
	const [showEditAcctModal, setShowEditAcctModal] = useState(false);
	const [showCreatePaymentModal, setShowCreatePaymentModal] = useState(false);
	const [showTOCModal, setShowTOCModal] = useState(false);

	const [shownTerritory, setShownTerritory] = useState(false);
	const [checkedTerritories, setCheckedTerritories] = useState([]);
	const [targetIndustry, setTargetIndustry] = useState(null);
	const [productType, setProductType] = useState('');
	const [territories, setTerritories] = useState([]);
	const [targetAccount, setTargetAccount] = useState(null);
	const [paymentMethod, setPaymentMethod] = useState(null);

	const [agreeTOC, setAgreeTOC] = useState(false);

	// Add-ons
	const [sfdu, setSfdu] = useState(false);
	const [guestList, setGuestList] = useState(false);
	const [termMonths, setTermMonths] = useState('');
	const [startDate, setStartDate] = useState('');

	/**************************************************************************************
	 *** REF CALLBACKS ********************************************************************
	 **************************************************************************************/
	const accordionRef = useCallback(node=>{
		if(node){
			node.addEventListener('show.bs.collapse', e=>{
				setShownTerritory(e.target.dataset.territory)
			});
		}
	});

	/**************************************************************************************
	 *** ENFORCE LOGIN ********************************************************************
	 **************************************************************************************/
	const isLoggedIn = appProvider.isLoggedIn();
	useEffect(()=>{
		if(!isLoggedIn) navigate('/login');
	}, [isLoggedIn, navigate]);
	if(!isLoggedIn) return null;

	/**************************************************************************************
	 *** HEPLER FUNCTS ********************************************************************
	 **************************************************************************************/
	const deleteSelectedAreas = () => {
		setTerritories([...territories.filter(t=>{
			let terrName = t.crrt.toUpperCase() === 'ALL' ? t.zip : `${t.zip}-${t.crrt}`;
			return !checkedTerritories.includes(terrName);
		})]);
		setCheckedTerritories([]);
	};

	const deleteArea = area => {
		setTerritories([...territories.filter(t=>{
			let terrName = t.crrt.toUpperCase() === 'ALL' ? t.zip : `${t.zip}-${t.crrt}`;
			return terrName !== area;
		})]);
	};

	const resetAddOns = () => {
		setSfdu(false);
		setGuestList(false);
		setTermMonths('');
		setStartDate('');
	};

	/**************************************************************************************
	 *** SUBMIT ORDER FUNCTION ************************************************************
	 **************************************************************************************/

	const placeOrder = async () => {
		if(!productType){
			setErrorMsg("No product selected!");
			return;
		}
		if(productType === 'nm-pc' || productType === 'nm-wp'){
			if(!termMonths){
				setErrorMsg("No term length selected!");
				return;
			}else if(!startDate){
				setErrorMsg("No start date selected!");
				return;
			}
		}
		if(!targetAccount){
			setErrorMsg("Create or select and account!");
			return;
		}
		if(productType === 'nm-wp' && !targetIndustry){
			setErrorMsg("Select an Industry Code!");
			return;
		}
		if(!territories.length){
			setErrorMsg("Select some target areas!");
			return;
		}
		if(!paymentMethod){
			setErrorMsg("Select a payment method!");
			return;
		}
		if(!agreeTOC){
			setErrorMsg("You must agree to the Terms and Conditions!");
			return;
		}
	};

	/**************************************************************************************
	 *** JSX: LINE ITEMS ******************************************************************
	 **************************************************************************************/
	let lineItemsDisplay = null;
	if(!productType){
		lineItemsDisplay = <p className='mb-0'>Select a Product first.</p>;
	}
	if(!lineItemsDisplay && productType === 'nm-pc'){
		if(!termMonths){
			lineItemsDisplay = <p className='mb-0'>Select a Term Length first.</p>;
		}else if(!startDate){
			lineItemsDisplay = <p className='mb-0'>Select a Start Date first.</p>;
		}
	}
	if(!lineItemsDisplay && productType === 'nm-wp'){
		if(!termMonths){
			lineItemsDisplay = <p className='mb-0'>Select a Term Length first.</p>;
		}else if(!startDate){
			lineItemsDisplay = <p className='mb-0'>Select a Start Date first.</p>;
		}
	}
	if(!lineItemsDisplay && !targetAccount){
		lineItemsDisplay = <p className='mb-0'>Select or create an account first.</p>;
	}
	if(!lineItemsDisplay && productType === 'nm-wp' && !targetIndustry){
		lineItemsDisplay = <p className='mb-0'>Select an Industry Code first.</p>;
	}
	if(!lineItemsDisplay && !territories.length){
		lineItemsDisplay = <p className='mb-0'>Select some target areas first.</p>;
	}
	if(!lineItemsDisplay){
		const format = dec => parseFloat(dec.toFixed(2)).toLocaleString('en-US', {style: 'currency', currency: 'USD'});
		let baseRate = productType === 'nm-wp' ? .99 : 1.21;
		let lineItems = [];
		let total = 0;
		for(let i=0; i<territories.length; i++){
			let terr = territories[i];
			let terr_total = 0;
			let label = `${terr.zip}-${terr.crrt}`;
			let text = `${format(baseRate)} Base Rate`;
			terr_total += baseRate;
			if(guestList){
				text = `${text} + ${format(.08)} Guest List Fee`;
				terr_total += .08;
			}
			if(terr.crrt.toUpperCase() !== 'ALL'){
				text = `${text} + ${format(.14)} CRRT Fee`;
				terr_total += .14;
			}
			let multiplier = sfdu ? parseFloat(terr.sfdu_avail_avg) : parseFloat(terr.avail_avg);
			terr_total = terr_total * multiplier;
			text = `(${text}) × ${multiplier} ${sfdu ? 'Single Family Homes' : 'Homes'} = ${format(terr_total)} Total Zip Code Cost`;
			total += terr_total;
			lineItems.push({label, text, terr_total});
		}
		lineItemsDisplay = <div>
			{lineItems.map(({label, text, terr_total}, idx)=><div key={idx}>
				<div className="line-item-container d-flex align-items-end">
					<span className="line-item-text me-2">{label}</span>
					<div className="dotted-line flex-grow-1"></div>
					<span className="line-item-amount ms-2">{format(terr_total)}</span>
				</div>
				<small className='text-secondary mb-3'>{text}</small>
			</div>)}
			<hr />
			<div className="line-item-container d-flex align-items-end">
				<span className="line-item-text me-2">Total Estimated Charges</span>
				<div className="dotted-line flex-grow-1"></div>
				<span className="line-item-amount ms-2">{format(total)}</span>
			</div>
		</div>;
	}

	/**************************************************************************************
	 *** JSX: ACCOUT SECTION **************************************************************
	 **************************************************************************************/
	let accountDisplay;
	let accountCols = {"first_name":"First Name","last_name":"Last Name","company_name":"Company","email":"Email","phone":"Phone","address1":"Address","address2":"Suite/Unit","city":"City","state":"State","zip":"Zip"};
	if(targetAccount){
		let subtext = <div className='text-secondary mb-2'>No sponsor assigned.</div>;
		if(Array.isArray(targetAccount?.sponsor) && Object.keys(targetAccount?.sponsor).length){
			subtext = <div className='text-secondary mb-2'>Sponsor #{targetAccount?.sponsor.sponsorid} {targetAccount?.sponsor.sponsorname}</div>;
		}
		accountDisplay = <>
			<div className='mb-0'>
				<big><b className='me-2'>Account #{`${targetAccount.jps_user_id}`.padStart(6,'0')}</b></big> 
				<span className='me-2'>|</span> <a href='#' onClick={e=>{e.preventDefault(); setShowEditAcctModal(true);}} className='me-2'>Edit</a> 
				<span className='me-2'>|</span> <a href='#' onClick={e=>{e.preventDefault(); setTargetAccount(null);}}>Change</a>
			</div>
			{subtext}
			<img style={{maxWidth:'200px'}} src={targetAccount.logo ? `https://rockwell.ourtownamerica.com/intra/api/ordersys/serve-logo.php?img=${targetAccount.logo}&_=${new Date().getTime()}` : `${base_url}assets/img/no-img-logo.png`} />
			<div className='row'>
				{Object.keys(accountCols).filter(k=>!!targetAccount[k]).map(k=>{
					return <div className='col-md-4 mb-2' key={k}>
						<small className='text-secondary d-block'>{accountCols[k]}</small>
						<div>{targetAccount[k]}</div>
					</div>;
				})}
			</div>
			{showEditAcctModal && <SubaccountModal editAccountId={targetAccount.jps_user_id} onClose={()=>setShowEditAcctModal(false)} onSuccess={acct=>{setTargetAccount(acct);}} />}
		</>
	}else{
		const handleAccountChange = acct => {
			let ind = null;
			if(acct?.sponsor?.industry?.oticcode){
				ind = {
					id: acct.sponsor.industry.oticcode, 
					text: `(${acct.sponsor.industry.oticcode}) ${acct.sponsor.industry.oticdescription}`
				};
			}
			setTargetIndustry(ind);
			setTargetAccount(acct);
		};
		accountDisplay = <>
			<AccountSelect onChange={handleAccountChange} />
			<small>or <a href='#' onClick={e=>{e.preventDefault(); setShowCreateAcctModal(true);}}>Create a New Account</a></small>
			{showCreateAcctModal && <SubaccountModal onClose={()=>setShowCreateAcctModal(false)} onSuccess={acct=>{setTargetAccount(acct); setTargetIndustry(null); setShowCreateAcctModal(false);}} />}
		</>
	}

	/**************************************************************************************
	 *** JSX: DELETE SELECTED AREAS BTN ***************************************************
	 **************************************************************************************/
	let deleteCheckedButton = '';
	if(checkedTerritories.length){
		deleteCheckedButton = <div className='my-2'>
			<button className='btn btn-sm btn-danger' onClick={deleteSelectedAreas}>
				{checkedTerritories.length === 1 ? 'Delete selected area' : `Delete ${checkedTerritories.length} selected areas`}
			</button>
		</div>
	}

	/**************************************************************************************
	 *** JSX: PRODUCT ADD-ONS *************************************************************
	 **************************************************************************************/
	let addOns;
	if(!productType){
		addOns = <p className='mb-0'>Select a product first.</p>
	}else if(productType === 'nm-pc'){
		addOns = <div className="mt-0">
			<div className="form-check">
				<input className="form-check-input" type="checkbox" checked={false} disabled={true} />
				<label className="form-check-label">Industry Exclusivity (Not available for the NM Postcard)</label>
			</div>
			<div className="form-check">
				<input className="form-check-input" type="checkbox" checked={sfdu} onChange={e=>setSfdu(e.target.checked)} />
				<label className="form-check-label">Single-family Homes only</label>
			</div>
			<div className="form-check">
				<input className="form-check-input" type="checkbox" checked={guestList} onChange={e=>setGuestList(e.target.checked)} />
				<label className="form-check-label">Guest List</label>
			</div>
			<div className="mb-3 mt-3">
				<select className="form-select" value={termMonths} onChange={e=>{setTermMonths(e.target.value);}}>
					<option value=''>Select term length</option>
					<option value='1'>1 month term</option>
					<option value='2'>2 month term</option>
					<option value='3'>3 month term</option>
					<option value='4'>4 month term</option>
					<option value='5'>5 month term</option>
					<option value='6'>6 month term</option>
					<option value='7'>7 month term</option>
					<option value='8'>8 month term</option>
					<option value='9'>9 month term</option>
					<option value='10'>10 month term</option>
					<option value='11'>11 month term</option>
					<option value='12'>12 month term</option>
				</select> 
			</div>
			<div className="mt-0">
				<select className="form-select" value={startDate} onChange={e=>setStartDate(e.currentTarget.value)}>
					<option value=''>Select start date</option>
					{Array(18).fill(1).map((v,i)=>{
						let date = new Date();
						date.setMonth(date.getMonth()+i);
						let monthIdx = date.getMonth();
						let year = date.getFullYear();
						let monthTextArray = ['Jan','Feb','Mar','Apr','May','Jun',
										'Jul','Aug','Sep','Oct','Nov','Dec'];
						let monthText = monthTextArray[monthIdx];
						let yearShort = `${year}`.substring(2);
						let text = `${monthText}-${yearShort}`;
						let value = `${monthIdx+1}`.padStart(2,'0')+"/"+year;
						return <option value={value} key={value}>Starting: {text}</option>;
					})}
				</select>
			</div>
		</div>
	}else if(productType === 'nm-wp'){
		addOns = <div className="mb-3 mt-0">
			<div className="form-check">
				<input className="form-check-input" type="checkbox" checked={true} disabled={true} />
				<label className="form-check-label">Industry Exclusivity (Included in the Welcome Package option)</label>
			</div>
			<div className="form-check">
				<input className="form-check-input" type="checkbox" checked={sfdu} onChange={e=>setSfdu(e.target.checked)} />
				<label className="form-check-label">Single-family Homes only</label>
			</div>
			<div className="form-check">
				<input className="form-check-input" type="checkbox" checked={guestList} onChange={e=>setGuestList(e.target.checked)} />
				<label className="form-check-label">Guest List</label>
			</div>
			<div className="mb-3 mt-3">
				<select className="form-select" value={termMonths} onChange={e=>{setTermMonths(e.target.value);}}>
					<option value=''>Select term length</option>
					<option value='6'>6 month term</option>
					<option value='7'>7 month term</option>
					<option value='8'>8 month term</option>
					<option value='9'>9 month term</option>
					<option value='10'>10 month term</option>
					<option value='11'>11 month term</option>
					<option value='12'>12 month term</option>
				</select> 
			</div>
			<div className="mb-3 mt-0">
				<select className="form-select" value={startDate} onChange={e=>setStartDate(e.currentTarget.value)}>
					<option value=''>Select start date</option>
					{Array(18).fill(1).map((v,i)=>{
						let date = new Date();
						date.setMonth(date.getMonth()+i);
						let monthIdx = date.getMonth();
						let year = date.getFullYear();
						let monthTextArray = ['Jan','Feb','Mar','Apr','May','Jun',
										'Jul','Aug','Sep','Oct','Nov','Dec'];
						let monthText = monthTextArray[monthIdx];
						let yearShort = `${year}`.substring(2);
						let text = `${monthText}-${yearShort}`;
						let value = `${monthIdx+1}`.padStart(2,'0')+"/"+year;
						return <option value={value} key={value}>Starting: {text}</option>;
					})}
				</select>
			</div>
		</div>
	}else{
		addOns = <p>No Add-ons available.</p>
	}

	/**************************************************************************************
	 *** RENDER COMPONENT *****************************************************************
	 **************************************************************************************/
	return (<Page>
		<PageHeader icon={faEnvelopesBulk} title='New Order' />
		
		<div className="card mb-3">
			<div className="card-header">
				<h4 className='mb-0'>Product</h4>
				<small className='text-secondary d-block'>Which type of mailing are we ordering?</small>
			</div>
			<div className="card-body">
				<div className="mt-0">
					<select className="form-select" value={productType} onChange={e=>{setProductType(e.target.value); resetAddOns();}}>
						<option value=''>Select one</option>
						<option value='nm-pc'>New Mover Postcard</option>
						<option value='nm-wp'>New Mover Welcome Package</option>
					</select> 
				</div>
			</div>
		</div>

		<div className="card mb-3">
			<div className="card-header">
				<h4 className='mb-0'>Add-ons</h4>
				<small className='text-secondary d-block'>Let's get it just the way you want it.</small>
			</div>
			<div className="card-body">
				{addOns}
			</div>
		</div>
		
		<div className="card mb-3">
			<div className="card-header">
				<h4 className='mb-0'>Account</h4>
				<small className='text-secondary d-block'>Who is the order for? The first time a New Mover product order is placed for this account, Sponsor Services will assign a Sponsor Number to the account.</small>
			</div>
			<div className="card-body">
				{accountDisplay}
			</div>
		</div>

		{productType === 'nm-wp' && <div className="card mb-3">
			<div className="card-header">
				<h4 className='mb-0'>Industry Code</h4>
				<small className='text-secondary d-block'>Industry Code is required to ensure exclusivity in our New Mover products. When the account is assigned to a Sponsor, this will reflect the Sponsor's assigned Industry Code.</small>
			</div>
			<div className="card-body">
				<OTICSelect onChange={setTargetIndustry} initialValue={targetIndustry} disabled={!!targetAccount?.sponsor?.industry?.oticcode} />
			</div>
		</div>}

		<div className="card mb-3">
			<div className="card-header">
				<h4 className='mb-0'>Territory</h4>
				<small className='text-secondary d-block'>What area are we targeting?</small>
			</div>
			<div className="card-body">
				<TerritoryChooser onAddTerritories={t=>setTerritories([...territories, ...t])} />

				{deleteCheckedButton}
				<div className="accordion" id="TerritoryDataDisplayAccordion" ref={accordionRef}>
					{territories.map(terr=>{ 
						let terrName = terr.crrt.toUpperCase() === 'ALL' ? terr.zip : `${terr.zip}-${terr.crrt}`;

						let terrTable = {
							"Territory": terr.zip + (terr.crrt === 'All' ? '' : `-${terr.crrt}`),
							"Homes": terr.homes,
							"Businesses": terr.businesses,
							"Apartments": terr.apartments,
							"Population": terr.population,
							"Total Addresses": terr.total_addresses,
							"City": terr.city+", "+terr.state,
							"County": terr.county,
							"Avail Avg": terr.avail_avg,
							"SFDU Avail Avg": terr.sfdu_avail_avg,
							"MFDU Avail Avg": terr.mfdu_avail_avg,
							"Residential": terr.residential,
							"Business": terr.business,
							"Median Age": terr.median_age,
							"Median Income": "$"+(terr.median_income||'').toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
							"Median Size": terr.median_size,
						};

						return (<div className="accordion-item" key={terrName}>
							<h2 className="accordion-header">
								<button 
									className="accordion-button collapsed" 
									type="button" 
									aria-expanded="false" 
									aria-controls={`TerritoryDataDisplayAccordion${terrName}`}
									onClick={e=>{
										if (e.target.type === 'checkbox') return;
										const collapseEl = document.getElementById(`TerritoryDataDisplayAccordion${terrName}`);
										const bsCollapse = bootstrap.Collapse.getOrCreateInstance(collapseEl);
										bsCollapse.toggle();
									}}>
									<input 
										type="checkbox" 
										className="form-check-input me-2" 
										onClick={e=>e.stopPropagation()} 
										onChange={(e) => {
											let newTerritories = [...checkedTerritories];
											if(e.target.checked){
												if(!newTerritories.includes(terrName)){
													newTerritories.push(terrName);
												}
											}else{
												newTerritories = newTerritories.filter(t=>t!=terrName);
											}
											setCheckedTerritories(newTerritories);
										}}
										style={{marginLeft: '0.075rem'}}
										checked={checkedTerritories.includes(terrName)}
									/>
									<span className="ms-4">{terrName}</span>
								</button>
							</h2>
							<div id={`TerritoryDataDisplayAccordion${terrName}`} data-territory={terrName} className="accordion-collapse collapse" data-bs-parent="#TerritoryDataDisplayAccordion">
								<div className="accordion-body">
									
									<table className='table table-striped table-hover table-borderless table-sm'>
										<tbody>
											{Object.keys(terrTable).map(key=>{
												return (<tr key={`${terrTable.Territory}-${key}`}><th>{key}</th><td>{terrTable[key]}</td></tr>);
											})}
										</tbody>
									</table>
									<button className="btn btn-danger w-100 mt-3" type="button" onClick={()=>deleteArea(terrName)}><FontAwesomeIcon icon={faCircleMinus} /> Delete {terr.crrt === 'All' ? 'Zip' : `Route`}</button>

								</div>
							</div>
						</div>);
					})}
				</div>
				{deleteCheckedButton}
			</div>
		</div>

		<div className="card mb-3">
			<div className="card-header">
				<h4 className='mb-0'>Order Summary & Charges</h4>
				<small className='text-secondary d-block'>How it all shakes out.</small>
			</div>
			<div className="card-body">
				{lineItemsDisplay}
			</div>
		</div>

		<div className="card mb-3">
			<div className="card-header">
				<h4 className='mb-0'>Payment</h4>
				<small className='text-secondary d-block'>We'll place a hold on your card for the amount shown above. The actual charge may vary depending on the number of pieces mailed. The charge will be captured when your order is ready to mail.</small>
			</div>
			<div className="card-body">
				<PaymentSelect onChange={setPaymentMethod} initialValue={paymentMethod} />
				<small>or <a href='#' onClick={e=>{e.preventDefault(); setShowCreatePaymentModal(true);}}>Add a New Payment Method</a></small>
				{showCreatePaymentModal && <PaymentModal onClose={()=>setShowCreatePaymentModal(false)} onSuccess={pmt=>{setPaymentMethod(pmt ? ({id: pmt.id, text:`${pmt.card_type} ending in ${pmt.card_no}`}) : null); setShowCreatePaymentModal(false);}} />}
			</div>
		</div>

		<div className="form-check mt-4">
			<input className="form-check-input" type="checkbox" checked={agreeTOC} onChange={e => setAgreeTOC(e.target.checked)} />
			<label className="form-check-label">I have read and agree to the <a href='#' onClick={e=>{e.preventDefault(); setShowTOCModal(true);}} >Terms and Conditions</a></label>
			{showTOCModal && <Alert title='Terms & Conditions' onClose={()=>setShowTOCModal(false)}><TermsAndConditions /></Alert>}
		</div>

		<button className='mt-3 btn btn-primary' onClick={placeOrder}>Place Order</button>
		{errorMsg && <Alert title='Error' onClose={()=>setErrorMsg('')}><div className='alert alert-danger'>{errorMsg}</div></Alert>}
	</Page>);
}