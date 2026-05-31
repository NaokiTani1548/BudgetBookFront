import { Box, CircularProgress, Typography } from '@mui/material'

export default function Loading() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        gap: 2,
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CircularProgress
          size={60}
          thickness={4}
          sx={{ color: 'primary.main' }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '1.5rem',
          }}
        >
          🏠
        </Box>
      </Box>
      <Typography variant="body2" color="text.secondary">
        読み込み中...
      </Typography>
    </Box>
  )
}