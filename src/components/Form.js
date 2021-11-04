import { useState } from 'react'
import { CSVLink } from "react-csv";
import Spinner from './Spinner';
import moment from 'moment'
import '../styles.css'

const Form = () => {

    const [ website, setWebsite ] = useState("")
    const [ errorMessage, setErrorMessage ] = useState("")
    const [ perPage, setPerPage ] = useState(20)
    const [ blogJson, setBlogJson ] = useState([])
    const [ isReady, setIsReady ] = useState(false)
    const [ error, setError ] = useState(false)
    const [ isLoading, setIsLoading ] = useState(false);

    const headers = [
        { label: "title", key: 'title' },
        { label: 'body', key: 'content' },
        { label: 'image', key: 'image' },
        { label: 'author_name', key: 'author' },
        { label: 'author_image', key: '' },
        { label: 'language', key: '' },
        { label: 'publish_date', key: 'publish_date' },
        { label: 'tags', key: 'tag_list' }
    ]

    const apiCall = async (e) => {
        e.preventDefault()

        if(website.trim() === '') {
            setError(true)
            setIsReady(false)
            setErrorMessage("Website field is empty")
            return
        }
        setIsReady(false)
        setIsLoading(true)

        const api = await fetch(`${website}/api/v1/blogs.json?per_page=${perPage}`)
        const response = await api.json()
        let blogs = response.blogs

        

        // if there's not error key in object
        if(!response.hasOwnProperty("error")) {
            blogs.forEach(blog => {
                blog["tag_list"] = blog["tag_list"].split("|").join(",")
                blog["publish_date"] = moment(blog["publish_date"]).format("YYYY-MM-DD HH:mm:ss")
                blog["image"] = `${website}${blog["image"]}`
            })
            console.log(blogs);
            setError(false)
            setBlogJson(blogs)
            setIsReady(true)
            
            
        // if error key exists in object
        } else {
            setError(true)
            setIsReady(false)
            setErrorMessage(response.error)
        }
        setIsLoading(false)
    }
    


    return (
        <>
            <div className="card">
                <div className="card-header">
                    JSON to CSV Blogs downloader
                </div>
                <div className="card-body">
                    <h5 className="card-title">How to use:</h5>
                    <ol className="pl-0">
                        <li className="mb-2">Introduce a Website URL. <span className="d-block">Example: https://www.volcanic.com</span></li>
                        <li className="mb-2">Type how many blogs you would like in your CSV file. default: 20 blogs</li>
                        <li className="mb-2">Click 'Load JSON' button</li>
                        <li className="mb-2">Relax</li>
                        <li className="mb-2">Download your CSV file</li>
                    </ol>
                    <form>
                        <div className="mb-3">
                                <label htmlFor="website" className="form-label">Website JSON URL:</label>
                                <input
                                    className="form-control"
                                    type="text"
                                    id="website"
                                    onChange={e => setWebsite(e.target.value)}
                                />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="per_page" className="form-label">How many blogs?</label>
                            <input
                                className="form-control"
                                type="number"
                                id="per_page"
                                placeholder="20"
                                onChange={e => setPerPage(e.target.value)}
                            />
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={apiCall}
                        >
                        Load JSON
                        </button>
                        { error ? <span className="text-danger mt-3 d-block fw-bold">{ errorMessage }</span> : null }
                        { isLoading ? <Spinner /> : null }
                        { isReady ? 
                            <div className="mt-3">
                                <CSVLink
                                    className="btn btn-success"
                                    headers={headers}
                                    data={blogJson}
                                    filename={"blogs.csv"}
                                    separator=";"
                                    >
                                    Download
                                </CSVLink>
                            </div>
                            :
                            null
                        }
                    </form> 
                </div>
            </div>
        </>
    )
}

export default Form
