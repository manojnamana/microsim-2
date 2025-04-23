import axios from "axios"
import { ApiUrl } from "../DbApi/apiUrl"

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
    try {
        const response = await axios.put(
            `${ApiUrl}wiki/remix/mcq_content/`,
            {
                wikipedia_url: `https://en.wikipedia.org/wiki/${wikiText}`,
                mcq_content :sendObject,
               
            }
        )
        return response
    } catch(err) {
        return err.response
    }
}