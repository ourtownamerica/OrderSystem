import { useParams, useNavigate } from "react-router-dom";
import {useEffect, useState, useContext} from 'react';
import AppContext from "../provider/AppContext.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandshakeAngle, faSpinner} from '@fortawesome/free-solid-svg-icons';
import PageHeader from "../components/PageHeader.jsx";
import Page from "../components/Page.jsx";

export default function HelpCategory(){
	const {slugOrId} = useParams();
	let [loading, setLoading] = useState(false);
	let [cat, setCat] = useState(null);
	const navigate = useNavigate();
	const appProvider = useContext(AppContext);

	useEffect(()=>{
		(async ()=>{
			setLoading(true);
			setCat(await appProvider.getHelpCategory(slugOrId));
			setLoading(false);
		})();
	}, []);

	let pageBody;
	if(loading){
		pageBody = (<div className='text-center'>
			<FontAwesomeIcon icon={faSpinner} className="fa-spin-pulse" />
		</div>);
	}else if(!cat?.category){
		pageBody = (<p className='text-center text-secondary'>Category not found.</p>);
	}else if(!cat?.topics?.length){
		pageBody = (<p className='text-center text-secondary'>No topics available for this category.</p>);
	}else{

		let topicRows = [], row = [], rowsize = 4;
		cat.topics.forEach(topic=>{
			row.push(topic);
			if(row.length === rowsize){
				topicRows.push([...row]);
				row = [];
			}
		});
		if(row.length) topicRows.push([...row]);

		pageBody = (<>
			<p>{cat.category.overview}</p>
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
		<PageHeader icon={faHandshakeAngle} title={cat?.category?.category||'Help Category'} />
		{pageBody}
	</Page>);
}