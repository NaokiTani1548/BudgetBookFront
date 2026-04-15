import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  typography: {
    fontFamily: '"Noto Sans JP", sans-serif',
  },
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#ff9800',
    },
    background: {
      default: '#f5f5f5',
    },
  },
})

export default theme