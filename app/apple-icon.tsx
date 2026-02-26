import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(to bottom right, #FF4500, #FF6A00)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 40,
                }}
            >
                <span
                    style={{
                        color: 'white',
                        fontSize: 90,
                        fontWeight: 900,
                        fontFamily: 'Inter, sans-serif',
                    }}
                >
                    A-S
                </span>
            </div>
        ),
        { ...size }
    )
}
