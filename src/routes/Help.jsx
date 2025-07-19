import { faHandshakeAngle, faSpinner, faMagnifyingGlass} from '@fortawesome/free-solid-svg-icons';
import {useState, useContext, useEffect, useRef } from 'react';
import AppContext from "../provider/AppContext.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import Page from '../components/Page.jsx';

export default function Help(){
	let [loading, setLoading] = useState(false);
	let [categories, setCategories] = useState([]);
	let [searchResults, setSearchResults] = useState(null);
	let [searchTerm, setSearchTerm] = useState('');
	const navigate = useNavigate();
	const appProvider = useContext(AppContext);
	let timer = useRef();

	useEffect(()=>{
		(async ()=>{
			setLoading(true);
			setCategories(await appProvider.getAllHelpCategories());
			setLoading(false);
		})();
	}, []);

	useEffect(()=>{
		if(!searchTerm.trim()){
			setSearchResults(null);
		}else{
			if(timer.current != null) clearTimeout(timer.current);
			timer.current = setTimeout(async ()=>{
				setLoading(true);
				setSearchResults(await appProvider.searchHelpTopics(searchTerm));
				setLoading(false);
			}, 1000);
		}
	}, [searchTerm]);

	let pageBody;
	if(loading){
		pageBody = (<div className='text-center'>
			<FontAwesomeIcon icon={faSpinner} className="fa-spin-pulse" />
		</div>);
	}else if(searchResults === null){

		let categoryRows = [], row = [], rowsize = 4;
		categories.forEach(cat=>{
			row.push(cat);
			if(row.length === rowsize){
				categoryRows.push([...row]);
				row = [];
			}
		});
		if(row.length) categoryRows.push([...row]);

		pageBody = (<>
			{categoryRows.map((row, rowIdx)=>{
				return (<div className='row' key={rowIdx}>
					{row.map((col,colIdx)=>{
						return (<div className='col-md-3 text-center d-flex' key={colIdx}>
							<div className='card flex-fill mt-3'>
								<div className='card-header text-center'>
									<h5>{col.category}</h5>
								</div>
								<div className='card-body text-center d-flex flex-column'>
									<p className='flex-grow-1'>{col.overview}</p>
									<button className='btn btn-primary w-100' onClick={e=>{e.preventDefault(); navigate(`/helpcategory/${col.slug}`); }}>View Category</button>
								</div>
							</div>
						</div>);
					})}
				</div>);
			})}
		</>);
	}else if(!searchResults?.length){
		pageBody = (<p className='text-center text-secondary'>No search results for: <i>{searchTerm}</i></p>);
	}else{

		let topicRows = [], row = [], rowsize = 4;
		searchResults.forEach(topic=>{
			row.push(topic);
			if(row.length === rowsize){
				topicRows.push([...row]);
				row = [];
			}
		});
		if(row.length) topicRows.push([...row]);

		pageBody = (<>
			{topicRows.map((row, rowIdx)=>{
				return (<div className='row' key={rowIdx}>
					{row.map((col,colIdx)=>{
						return (<div className='col-md-3 text-center d-flex' key={colIdx}>
							<div className='card flex-fill mt-3'>
								<div className='card-header text-center'>
									<h5>{col.title}</h5>
									<div className='sm text-secondary'>by {col.author}</div>
								</div>
								<div className='card-body text-center d-flex flex-column'>
									<p className='flex-grow-1'>{col.overview}</p>
									<button className='btn btn-primary w-100' onClick={e=>{e.preventDefault(); navigate(`/helptopic/${col.slug}`); }}>View Topic</button>
								</div>
							</div>
						</div>);
					})}
				</div>);
			})}
		</>);

	}

	return (<Page>
		<div>
			<PageHeader icon={faHandshakeAngle} title='Help' />
			<div className="input-group mb-3">
				<span className="input-group-text">
					<FontAwesomeIcon icon={faMagnifyingGlass} />
				</span>
				<input disabled={loading} type="text" className={`${loading && 'disabled'} form-control`} placeholder="Search Help Topics" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
			</div>

			{pageBody}
		</div>
	</Page>);
}