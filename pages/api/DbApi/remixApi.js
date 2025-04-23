import axios from "axios"
import { ApiUrl } from "../../api/DbApi/apiUrl"

export const UpdateRemixVersion = async(wikiText, remixField, remixData) => {
    try {
        const response = await axios.put(
            `${ApiUrl}wiki/remix/${remixField}/`,
            {
                wikipedia_url: `https://en.wikipedia.org/wiki/${wikiText}`,
                [remixField]: remixData
            }
        )
        return response
    } catch(err) {
        return err.response
    }
}

<<<<<<< HEAD
export const UpdateMcqContent = async(wikiText, mcqType, mcqData) => {
=======

export const UpdateMcqContent = async(wikiText, mcqType, mcqData) => {
    let sendObject = {}

    if(mcqType === "Summary"){
        sendObject = {
            summary: mcqData,
            code: [],
            simulator: []
        }
    }
    else if(mcqType === "Code"){
        sendObject = {
            summary: [],
            code: mcqData,
            simulator: []
        }
    }
    else if(mcqType === "Simulator Viewer"){
        sendObject = {
            summary: [],
            code: [],
            simulator: mcqData
        }
    }
>>>>>>> 82b81eb3f46b3dfcc52165814c475a5e4799be98
    try {
        const response = await axios.put(
            `${ApiUrl}wiki/remix/mcq_content/`,
            {
                wikipedia_url: `https://en.wikipedia.org/wiki/${wikiText}`,
<<<<<<< HEAD
                mcq_type: mcqType,
                mcq_content: mcqData
=======
                mcq_content :sendObject,
               
>>>>>>> 82b81eb3f46b3dfcc52165814c475a5e4799be98
            }
        )
        return response
    } catch(err) {
        return err.response
    }
}