import React from 'react'
import { Box, Typography } from "@mui/material";
import { useSelector } from 'react-redux';
import { user } from '../../redux/slices/auth.slice';

export default function ShowVideo({localVideoRef, videos}) {
    const name = useSelector(user)?.username || "Guest";
  return (
    <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                minWidth: 0,
              }}
            >
              {/* Local video */}
              <Box
                sx={{
                  flex: 1,
                  position: "relative",
                  borderRadius: "12px",
                  overflow: "hidden",
                  background: "#111827",
                  border: "1px solid #1e3a5f",
                  minHeight: 0,
                }}
              >
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    maxHeight: 352,
                  }}
                />
                {/* YOU badge */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 12,
                    left: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    bgcolor: "rgba(13,17,23,0.8)",
                    border: "1px solid #1e3a5f",
                    borderRadius: "6px",
                    px: 1.25,
                    py: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: "#3b82f6",
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.55)",
                      fontFamily: "monospace",
                      letterSpacing: "0.1em",
                    }}
                  >
                    YOU
                  </Typography>
                </Box>
              </Box>

              {/* Remote videos row */}
              {videos.length > 0 && (
                <Box
                  sx={{
                    height: 120,
                    display: "flex",
                    gap: "10px",
                    overflowX: "auto",
                    flexShrink: 0,
                    "&::-webkit-scrollbar": { height: 4 },
                    "&::-webkit-scrollbar-track": { background: "transparent" },
                    "&::-webkit-scrollbar-thumb": {
                      background: "#1e3a5f",
                      borderRadius: 4,
                    },
                  }}
                >
                  {videos.map((v) => (
                    <Box
                      key={v.socketId}
                      sx={{
                        position: "relative",
                        height: "100%",
                        aspectRatio: "16/9",
                        flexShrink: 0,
                        borderRadius: "10px",
                        overflow: "auto",
                        background: "#111827",
                        border: "1px solid #1e3a5f",
                      }}
                    >
                      <video
                        data-socket={v.socketId}
                        ref={(ref) => {
                          if (ref && v.stream) ref.srcObject = v.stream;
                        }}
                        autoPlay
                        playsInline
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 6,
                          left: 8,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.6,
                          bgcolor: "rgba(13,17,23,0.8)",
                          borderRadius: "4px",
                          px: 1,
                          py: 0.4,
                        }}
                      >
                        <Box
                          sx={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            bgcolor: "#22c55e",
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: 9,
                            color: "rgba(255,255,255,0.45)",
                            fontFamily: "monospace",
                          }}
                        >
                          {name}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
  )
}
