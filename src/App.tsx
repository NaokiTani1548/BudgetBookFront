import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, CssBaseline, Box, AppBar, Toolbar, Button, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { List, CalendarMonth, Category, Repeat } from '@mui/icons-material'
import theme from './theme'
import ListPage from './pages/ListPage'
import CalendarPage from './pages/CalendarPage'
import DayDetailPage from './pages/DayDetailPage'
import CategoryPage from './pages/CategoryPage'
import RecurringExpensePage from './pages/RecurringExpensePage'

function Navigation() {
  return (
    <AppBar position="static" sx={{ mb: 2 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 0, mr: 4 }}>
          💰 BudgetBook
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            color="inherit"
            component={RouterLink}
            to="/list"
            startIcon={<List />}
          >
            リスト
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/calendar"
            startIcon={<CalendarMonth />}
          >
            カレンダー
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/recurring"
            startIcon={<Repeat />}
          >
            定期支出
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/categories"
            startIcon={<Category />}
          >
            カテゴリ
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Navigate to="/list" replace />} />
          <Route path="/list" element={<ListPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/day/:date" element={<DayDetailPage />} />
          <Route path="/categories" element={<CategoryPage />} />
          <Route path="/recurring" element={<RecurringExpensePage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}