import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#5D9C59',
      light: '#7CB87A',
      dark: '#3E7D3E',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#F4A261',
      light: '#F7B87D',
      dark: '#E08C3F',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#E57373',
      light: '#EF9A9A',
      dark: '#D32F2F',
    },
    success: {
      main: '#81C784',
      light: '#A5D6A7',
      dark: '#66BB6A',
    },
    warning: {
      main: '#FFB74D',
      light: '#FFCC80',
      dark: '#FFA726',
    },
    background: {
      default: '#FFF8F0',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#4A4A4A',
      secondary: '#7A7A7A',
    },
  },
  typography: {
    fontFamily: [
      '"Noto Sans JP"',
      '"Hiragino Sans"',
      '"Hiragino Kaku Gothic ProN"',
      'Meiryo',
      'sans-serif',
    ].join(','),
    h4: {
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 20,
          padding: '8px 20px',
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          borderRadius: 16,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          overflow: 'hidden',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #F0E6DC',
          padding: '12px 16px',
        },
        head: {
          fontWeight: 700,
          backgroundColor: '#5D9C59',
          color: '#FFFFFF',
          fontSize: '0.875rem',
          whiteSpace: 'nowrap',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(even)': {
            backgroundColor: '#FFFCF8',
          },
          '&:hover': {
            backgroundColor: '#FFF5EB !important',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFCF8',
          borderRight: '1px solid #F0E6DC',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&:hover fieldset': {
              borderColor: '#5D9C59',
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '1rem',
        },
      },
    },
  },
})

export default theme