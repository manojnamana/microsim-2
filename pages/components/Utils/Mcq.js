import { ArrowBackIosNew, ArrowBackOutlined } from '@mui/icons-material';
import { Box, Button, Card, Stack, Typography, Radio, RadioGroup, FormControlLabel, FormControl, Alert, Chip, IconButton, Snackbar } from '@mui/material'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { UpdateMcqContent } from "../../api/DbApi/remixApi"



const Mcq = ({mcqOptions, mcqType, wikiText}) => {
  const [selectedAnswers, setSelectedAnswers] = useState(Array(mcqOptions?.length).fill(null))
  const [showAnswers, setShowAnswers] = useState(false)
  const [score, setScore] = useState(0)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const handleOptionSelect = (questionIndex, optionIndex) => {
    const newSelectedAnswers = [...selectedAnswers]
    newSelectedAnswers[questionIndex] = optionIndex
    setSelectedAnswers(newSelectedAnswers)
  }

  const handleSubmit = () => {
    let newScore = 0
    mcqOptions.forEach((mcq, index) => {
      if (selectedAnswers[index] === mcq.correctAnswer) {
        newScore++
      }
    })
    setScore(newScore)
    setShowAnswers(true)
  }


  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')
  const [snackbarOpen, setSnackbarOpen] = useState(false)

  const calculatePercentage = () => {
    return ((score / mcqOptions.length) * 100).toFixed(1)
  }

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const getAnswerStatus = (questionIndex) => {
    if (!showAnswers) return null
    const isCorrect = selectedAnswers[questionIndex] === mcqOptions[questionIndex].correctAnswer
    return {
      status: isCorrect ? "Correct" : "Incorrect",
      color: isCorrect ? "success" : "error"
    }
  }

  const handleSaveMcq = async () => {
    if (!mcqOptions || !mcqType || !wikiText) return
    console.log(mcqType)
    setSaving(true)
    try {
      showSnackbar("Saving MCQ...", "info")
      const response = await UpdateMcqContent(wikiText, mcqType, mcqOptions)
      
      if (response?.status === 200) { 
        showSnackbar('MCQ saved successfully!')
      } else {
        showSnackbar('Failed to save MCQ: ' + (response.data?.message || 'Unknown error'), 'error')
      }
    } catch (error) {
      console.error('Error saving MCQ:', error)
      showSnackbar('Error saving MCQ', 'error')
    } finally {
      setSaving(false)
    }
  }

  if(!mcqOptions){
    return (
    <Stack justifyContent={"center"} alignItems={"center"} height={"100vh"}>
      <Box sx={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
        <Typography variant="h4" textAlign={"center"} gutterBottom sx={{ mb: 4 }}>No data found</Typography>
      </Box>
    </Stack>
    )
  }

  return (
    <Card elevation={2} sx={{ p: 2, my:2 }}>
      <h3 className="text-lg font-semibold flex items-center gap-2 w-full md:w-auto mb-4">
        <span>🗎</span> Multiple Choice Questions ({mcqType})
      </h3>
      
      <Stack spacing={3}>
        {mcqOptions?.map((mcq, index) => {
          const answerStatus = getAnswerStatus(index)
          return (
            <Card key={index} elevation={2} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {index + 1}. {mcq.question}
                </Typography>
                {answerStatus && (
                  <Chip 
                    label={answerStatus.status}
                    color={answerStatus.color}
                    sx={{ ml: 2 }}
                  />
                )}
              </Box>
            
              <FormControl component="fieldset" sx={{ width: '100%' }}>
                <RadioGroup
                  value={selectedAnswers[index] !== null ? selectedAnswers[index] : ''}
                  onChange={(e) => handleOptionSelect(index, parseInt(e.target.value))}
                >
                  {mcq?.options.map((option, optIndex) => {
                    const isCorrectAnswer = showAnswers && optIndex === mcq.correctAnswer
                    const isSelectedAnswer = showAnswers && optIndex === selectedAnswers[index]
                    
                    return (
                      <FormControlLabel
                        key={optIndex}
                        value={optIndex}
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography>{option}</Typography>
                            {showAnswers && (
                              <>
                                {isCorrectAnswer && (
                                  <Chip 
                                    label="Correct Answer" 
                                    color="success" 
                                    size="small"
                                    sx={{ ml: 1 }}
                                  />
                                )}
                                {isSelectedAnswer && !isCorrectAnswer && (
                                  <Chip 
                                    label="Your Answer" 
                                    color="error" 
                                    size="small"
                                    sx={{ ml: 1 }}
                                  />
                                )}
                              </>
                            )}
                          </Box>
                        }
                        disabled={showAnswers}
                        sx={{
                          color: showAnswers
                            ? optIndex === mcq.correctAnswer
                              ? 'success.main'
                              : selectedAnswers[index] === optIndex
                              ? 'error.main'
                              : 'text.primary'
                            : 'text.primary',
                          '& .MuiFormControlLabel-label': {
                            width: '100%'
                          }
                        }}
                      />
                    )
                  })}
                </RadioGroup>
              </FormControl>

              {showAnswers && (
                <Alert 
                  severity={selectedAnswers[index] === mcq.correctAnswer ? "success" : "error"}
                  sx={{ mt: 2 }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    {selectedAnswers[index] === mcq.correctAnswer ? "Correct!" : "Incorrect"}
                  </Typography>
                  {mcq.explanation}
                </Alert>
              )}
            </Card>
          )
        })}
      </Stack>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleSaveMcq}
          disabled={!mcqOptions || !mcqType || saving}
        >
          {saving ? 'Saving...' : 'Save MCQ'}
        </Button>

        {!showAnswers ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={selectedAnswers.includes(null)}
          >
            Submit Answers
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setSelectedAnswers(Array(mcqOptions.length).fill(null))
              setShowAnswers(false)
              setScore(0)
            }}
          >
            Try Again
          </Button>
        )}
      </Box>

      <Snackbar
  open={snackbarOpen}
  autoHideDuration={6000}
  onClose={() => setSnackbarOpen(false)}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
>
  <Alert 
    onClose={() => setSnackbarOpen(false)} 
    severity={snackbarSeverity}
    sx={{ width: '100%' }}
  >
    {snackbarMessage}
  </Alert>
            </Snackbar>
    </Card>
  )
}

export default Mcq