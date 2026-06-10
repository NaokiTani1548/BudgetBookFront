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
      <Box
        sx={{
          position: 'relative',
          width: 80,
          height: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* ぐるぐるマーク（外側） */}
        <CircularProgress
          size={80}
          thickness={3}
          sx={{
            color: '#E86A33',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
        {/* ロゴ（中央） */}
        <Box
          component="img"
          src="/logo.png"
          alt="Loading"
          sx={{
            width: 40,
            height: 40,
            objectFit: 'contain',
          }}
        />
      </Box>
      <Typography variant="body2" color="text.secondary">
        読み込み中...
      </Typography>
    </Box>
  )
}