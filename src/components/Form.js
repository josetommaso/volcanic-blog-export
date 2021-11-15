import { useState } from 'react'
// import { CSVLink } from "react-csv-enclosing-fix";
import { CSVDownloader } from 'react-papaparse'
import Spinner from './Spinner';
import Error from './Error';
import moment from 'moment'
import '../styles.css'

const Form = () => {

    const [ website, setWebsite ] = useState("")
    const [ errorMessage, setErrorMessage ] = useState("")
    const [ error, setError ] = useState(false)
    const [ perPage, setPerPage ] = useState(10)
    const [ selector, setSelector ] = useState('')
    const [ blogJson, setBlogJson ] = useState([])
    const [ isReady, setIsReady ] = useState(false)
    const [ isLoading, setIsLoading ] = useState(false);

    const cheerio = require('cheerio');

    const scrapeBlog = async (url, selector) => {
        const data = await fetch(`${website}${url}`)
        const response = await data.text()
        const $ = cheerio.load(response) 
        const article = ($(selector).html())
        return article
    } 

    const validURL = str => {
        var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
          '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
          '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
          '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
          '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
          '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
        return !!pattern.test(str);
    }

    const apiCall = async (e) => {
        e.preventDefault()
        setIsReady(false)

        if(website.trim() === '') {
            setError(true)
            setIsReady(false)
            setErrorMessage("Website field is empty")
            return
        }

        if(!validURL(website)) {
            setError(true)
            setErrorMessage("Invalid URL")
            return
        }

        if(perPage <= 0) {
            setError(true)
            setErrorMessage("Blog quantity not valid")
            return
        }

        setIsLoading(true)

        

        try {
            const url = `${website}/api/v1/blogs.json?per_page=${perPage}`
            const response = await fetch(url)
            const result = await response.json()
            const blogs = result.blogs

            let newBlogsObject = []

            blogs.forEach(blog => {
                blog["tag_list"] = blog["tag_list"].split("|").join(",")
                blog["publish_date"] = moment(blog["publish_date"]).format("YYYY-MM-DD HH:mm:ss")
                blog["content"] = `<p class='font-weight-bold'>${blog.content}</p>`

                const { title, image, author, publish_date, tag_list, url } = blog

                scrapeBlog(url, selector)
                    .then((response) => {
                        const newBlogObject = {
                            "title": title,
                            "body": response,
                            "image": image,
                            "author_name": author,
                            "author_image": '',
                            "language": '',
                            "publish_date": publish_date,
                            "tags": tag_list
                        }
        
                        newBlogsObject.push(newBlogObject)
                        
                        setBlogJson(newBlogsObject)                   
        
                        setError(false)
                        setIsReady(true)
                })
                
            });

        } catch (error) {
            setError(true)
            setErrorMessage(`${error.message}`)
        }

        setIsLoading(false)
        
    }

    return (
        <>
            <div className="card my-5">
                <div className="card-header">
                    JSON to CSV Blogs downloader
                </div>
                <div className="card-body position-relative">
                    <h5 className="card-title">How to use:</h5>
                    <ol className="pl-0">
                        <li className="mb-2">Type a Website URL <span className="d-block">Example: https://www.volcanic.com</span></li>
                        <li className="mb-2">Type the article selector <span className="d-block">Example: #blog .container .col-md-6 article</span></li>
                        <li className="mb-2">Type how many blogs you would like in your CSV file. default: 10 blogs</li>
                        <li className="mb-2">Click 'Load JSON' button</li>
                        <li className="mb-2">Relax</li>
                        <li className="mb-2">Download your CSV file</li>
                    </ol>
                    <form>
                        <div className="mb-3">
                                <label htmlFor="website" className="form-label">Website URL:</label>
                                <input
                                    className="form-control"
                                    type="url"
                                    id="website"
                                    placeholder="https://www.volcanic.com"
                                    onChange={e => setWebsite(e.target.value)}
                                />
                        </div>
                        <div className="mb-3">
                                <label htmlFor="selector" className="form-label">Article selector:</label>
                                <input
                                    className="form-control"
                                    type="text"
                                    id="selector"
                                    placeholder="#blog .container .col-md-6 article"
                                    onChange={e => setSelector(e.target.value)}
                                />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="per_page" className="form-label">How many blogs?</label>
                            <input
                                className="form-control"
                                type="number"
                                id="per_page"
                                placeholder="20"
                                min="0"
                                onChange={e => setPerPage(e.target.value)}
                            />
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={apiCall}
                        >
                        Load JSON
                        </button>
                        { error ? <Error message={errorMessage} /> : null }
                        { isLoading ? <Spinner /> : null }
                        { isReady ? 
                            <div className="mt-3">
                                {
                                    <CSVDownloader
                                        data={blogJson}
                                        filename={'blogs'}
                                        type={'link'}
                                        className="btn btn-success"
                                    >
                                        Download
                                    </CSVDownloader>
                                }
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
