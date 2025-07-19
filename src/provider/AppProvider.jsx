import pkg from '/package.json';
import uuid from 'uuid-random';
import {detect} from 'detect-browser';
import EventEmitter from "events";
import { base_url } from '../config.jsx';

export default class AppProvider{
	#session = {};
	#events = new EventEmitter();

	#loadCount = 0;
	#caches = {};

	constructor(){
		this.#session = JSON.parse(localStorage.getItem('ossession') || '{}');
		this.#caches = JSON.parse(localStorage.getItem('oscaches') || '{}');
	}

	getLogoURL(){
		let logo = this.getProp('logo');
		return logo ? `https://rockwell.ourtownamerica.com/intra/api/ordersys/serve-logo.php?img=${logo}&_=${new Date().getTime()}` : `${base_url}assets/img/no-img-logo.png`;
	}

	validateCache(key, maxAge=null){
		if(!this.#caches.hasOwnProperty(key)) return false;
		let now = new Date().getTime();
		if(this.#caches[key].expires && now > this.#caches[key].expires){
			return false;
		}
		if(maxAge && this.#caches[key].time && this.#caches[key].time + maxAge < now){
			return false;
		}
		if(maxAge && !this.#caches[key].time){
			return false;
		}
		return true;
	}

	#setCache(key, value, expiresInSeconds){
		let now = new Date().getTime();
		const expires = expiresInSeconds ? now + (expiresInSeconds * 1000) : null;
		this.#caches[key] = {expires, value, time: now};
		localStorage.setItem('oscaches', JSON.stringify(this.#caches));
	}

	#getCache(key){
		if(!this.validateCache(key)){
			delete this.#caches[key];
			return null;
		} 
		return this.#caches[key].value;
	}

	#deleteCache(key){
		if(this.#caches.hasOwnProperty(key)){
			delete this.#caches[key];
			localStorage.setItem('oscaches', JSON.stringify(this.#caches));
		}
	}

	on(event, listener){
		this.#events.on(event, listener);
	}

	off(event, listener){
		this.#events.off(event, listener);
	}

	isLoggedIn(){
		return this.#session?.session_id != null && this.#session?.email_verified;
	}

	async uploadLogo(blob){
		let loadId = ++this.#loadCount;
		let event = {action: 'uploadlogo', message: "Uploading logo", loadId};
		this.#events.emit("loadStart", event);
		const token = this.#session?.session_id;
		const formData = new FormData();
		formData.append('logo', blob);
		formData.append('token', token);
		const response = await fetch(`https://rockwell.ourtownamerica.com/intra/api/ordersys/upload-logo.php`, {
			method: 'POST',
			body: formData
		});
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const result = await response.json();
		if(result.has_error){
			event.message = result.message;
			this.#events.emit("loadError", event);
			return;
		}
		this.#setProps({logo:result.data.logo});
		event.message = `Logo updated`;
		this.#events.emit("loadEnd", event);
	}

	async canHaveSubs(){
		if(!this.#session.hasOwnProperty('vanity_subs')) return true;
		return !!this.#session.vanity_subs;
	}

	async setVanity(slugorid){
		let res = await this.#api('getvanity', {slugorid});
		this.#setProps({
			vanity_logo: res.logo,
			vanity_name: res.company_name,
			vanity_uid: res.jps_user_id,
			vanity_subs: res.subaccounts_allowed
		});
	}

	async updateProfile(jps_username, first_name, last_name, slug, job_title, company_name, address1, address2, city, state, zip){
		let loadId = ++this.#loadCount;
		let event = {action: 'updateprofile', message: "Updating user details", loadId};
		try{
			this.#events.emit("loadStart", event);
			await this.#api('updateprofile', {jps_username, first_name, last_name, slug, job_title, company_name, address1, address2, city, state, zip});
			this.#setProps({jps_username, first_name, last_name, slug, job_title, company_name, address1, address2, city, state, zip});
			event.message = `User details changed!`;
			this.#events.emit("loadEnd", event);
		}catch(e){
			event.message = `Error modifying user details`;
			this.#events.emit("loadError", event);
			throw e.message || e;
		}
	}

	async getAllHelpCategories(){
		let data = this.#getCache('helpcategories');
		console.log('cached cats', data);
		if(data) return data;
		let loadId = ++this.#loadCount;
		let event = {action: 'helpcategories', message: "Downloading help categories", loadId};
		try{
			this.#events.emit("loadStart", event);
			data = await this.#api('helpcategories');
			console.log('non-cached cats', data);

			this.#setCache('helpcategories', data);
			event.message = `Downloaded help categories!`;
			this.#events.emit("loadEnd", event);
		}catch(e){
			event.message = `Error downloading help categories`;
			this.#events.emit("loadError", event);
			throw e.message || e;
		}
		return data;
	}

	async searchHelpTopics(query){
		let apiResponse;
		let loadId = ++this.#loadCount;
		let event = {action: 'searchhelp', message: "Searching help database", loadId};
		try{
			this.#events.emit("loadStart", event);
			apiResponse = await this.#api('searchhelp', {query});
			event.message = `Help search complete!`;
			this.#events.emit("loadEnd", event);
		}catch(e){
			event.message = `Error searching help database`;
			this.#events.emit("loadError", event);
			throw e.message || e;
		}
		return apiResponse;
	}

	async getHelpTopic(slug){
		let apiResponse;
		let loadId = ++this.#loadCount;
		let event = {action: 'helptopic', message: "Downloading help topic", loadId};
		try{
			this.#events.emit("loadStart", event);
			apiResponse = await this.#api('helptopic', {slug});
			event.message = `Help topic downloaded!`;
			this.#events.emit("loadEnd", event);
		}catch(e){
			event.message = `Error downloading help topic.`;
			this.#events.emit("loadError", event);
			throw e.message || e;
		}
		return apiResponse;
	}

	async getHelpCategory(slug){
		let apiResponse;
		let loadId = ++this.#loadCount;
		let event = {action: 'helpcategory', message: "Downloading help category", loadId};
		try{
			this.#events.emit("loadStart", event);
			apiResponse = await this.#api('helpcategory', {slug});
			event.message = `Downloaded help category!`;
			this.#events.emit("loadEnd", event);
		}catch(e){
			event.message = `Error downloading help category`;
			this.#events.emit("loadError", event);
			throw e.message || e;
		}
		return apiResponse;
	}

	getProp(prop){
		return this.#session.hasOwnProperty(prop) ? this.#session[prop] : null;
	}

	async createAccount(username, email, firstname, lastname, password, phone, title, company){
		let loadId = ++this.#loadCount;
		let event = {action: 'register', message: "Creating account", loadId};
		try{
			this.#events.emit("loadStart", event);
			await this.#api('register', {
				"username": username,
				"email": email,
				"password": password,
				"firstname": firstname,
				"lastname": lastname,
				"phone": phone,
				"company": company,
				"title": title,
				"parent_id": this.#session.hasOwnProperty('vanity_uid') ? this.#session.vanity_uid : null
			});
			event.message = `Created account!`;
			this.#events.emit("loadEnd", event);
		}catch(e){
			event.message = `Error creating account`;
			this.#events.emit("loadError", event);
			throw e.message || e;
		}
	}

	async resetPassword(username){
		let loadId = ++this.#loadCount;
		let event = {action: 'forgotpw', message: "Resetting Password", loadId};
		try{
			this.#events.emit("loadStart", event);
			await this.#api('forgotpw', {email: username});
			event.message = `Password reset.`;
			this.#events.emit("loadEnd", event);
		}catch(e){
			event.message = `Error resetting password`;
			this.#events.emit("loadError", event);
			throw e.message || e;
		}
	}

	async verifyEmail(code){
		let loadId = ++this.#loadCount;
		let event = {action: 'verifyemail', message: "Validating Token", loadId};
		try{
			this.#events.emit("loadStart", event);
			await this.#api('verifyemail', {
				"code": code
			});
			this.#setProps({email_verified: true});
			event.message = `Token validated`;
			this.#events.emit("loadEnd", event);
		}catch(e){
			event.message = `Could not validate token.`;
			this.#events.emit("loadError", event);
			throw e.message || e;
		}
	}

	async validatePWResetToken(username, code){
		let loadId = ++this.#loadCount;
		let event = {action: 'validatetoken', message: "Validating Token", loadId};
		try{
			this.#events.emit("loadStart", event);
			let data = await this.#api('validatetoken', {
				"email": username,
				"code": code
			});
			event.message = `Token validated`;
			this.#events.emit("loadEnd", event);
			return data.valid;
		}catch(e){
			event.message = `Could not validate token.`;
			this.#events.emit("loadError", event);
			throw e.message || e;
		}
	}

	async resetPWFromToken(username, code, password){
		let loadId = ++this.#loadCount;
		let event = {action: 'tokenpwreset', message: "Validating Token", loadId};
		try{
			this.#events.emit("loadStart", event);
			await this.#api('tokenpwreset', {
				"email": username,
				"code": code,
				"password": password
			});
			event.message = `Password updated!`;
			this.#events.emit("loadEnd", event);
		}catch(e){
			event.message = `Could not update password.`;
			this.#events.emit("loadError", event);
			throw e.message || e;
		}
	}

	async login(username, password){
		let loadId = ++this.#loadCount;
		let event = {action: 'login', message: "Logging in", loadId};
		try{
			this.#events.emit("loadStart", event);
			let userSessionData = await this.#api('login', {
				"email": username,
				"password": password
			});
			this.#setProps(userSessionData);
			event.message = `Logged in`;
			this.#events.emit("loadEnd", event);
		}catch(e){
			event.message = `Could not log in`;
			this.#events.emit("loadError", event);
			throw e.message || e;
		}
	}

	logout(){
		localStorage.setItem('ossession', '{}');
		this.#session = {};
		this.#caches = {};
	}

	async #api(action, params={}){
		params.token = this.#session?.session_id||'';
		params.action = action;
		
		let response = await fetch('https://rockwell.ourtownamerica.com/intra/api/ordersys/index.php', {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(params)
		});
		
		if (!response.ok) {
			document.body.insertAdjacentHTML('beforeend', `<div class='offline-modal'>
				<img class="mb-4 img-fluid" src='${base_url}assets/img/ot_house.png' />
				<div class='alert alert-danger'>You appear to be offline. Please refresh this page when your internet connection is restored.</div>
			</div>`);
			throw `There was an error communicating with the server.`;
		}

		const responseData = await response.json(); 
		if(responseData.has_error){
			throw responseData.message;
		}
		return responseData.data;
	}

	#getDeviceId(){
		return localStorage.getItem('osuuid') || uuid();
	}

	#setProps(props){
		Object.keys(props).forEach(key=>{
			this.#session[key] = props[key];
		});
		localStorage.setItem('ossession', JSON.stringify(this.#session));
	}
};