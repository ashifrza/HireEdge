import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf, deleteInterviewReport } from "../services/interview.api"
import { useCallback, useContext, useEffect } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        let response = null
        try {
            response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            setReport(response.interviewReport)
        } catch (error) {
            console.error(error)
            throw error
        }
        return response.interviewReport
    }

    const getReportById = useCallback(async (id) => {
        setLoading(true)
        let response = null
        try {
            response = await getInterviewReportById(id)
            setReport(response.interviewReport)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
        return response?.interviewReport
    }, [setLoading, setReport])

    const getReports = useCallback(async () => {
        setLoading(true)
        let response = null
        try {
            response = await getAllInterviewReports()
            setReports(response.interviewReports)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
        return response?.interviewReports
    }, [setLoading, setReports])

    const deleteReport = async (id) => {
        try {
            await deleteInterviewReport(id)
            setReports(prev => prev.filter(r => r._id !== id))
        } catch (error) {
            console.error(error)
            throw error
        }
    }

    const getResumePdf = async (interviewReportId) => {
        try {
            const { blob: pdfBlob, mode } = await generateResumePdf({ interviewReportId })

            if (!(pdfBlob instanceof Blob) || pdfBlob.size === 0) {
                throw new Error("The server returned an empty PDF. Please try again.")
            }

            const url = window.URL.createObjectURL(pdfBlob)
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            link.style.display = "none"
            document.body.appendChild(link)
            link.click()

            // Edge may not start reading the blob until after the click handler
            // returns. Revoking it immediately can cancel the download.
            window.setTimeout(() => {
                link.remove()
                window.URL.revokeObjectURL(url)
            }, 60000)
            return mode
        } catch (error) {
            console.error(error)
            throw error
        }
    }

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [interviewId, getReportById, getReports])

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf, deleteReport }
}
