import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
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
                    borderRadius: '22%',
                }}
            >
                <span
                    style={{
                        color: 'white',
                        fontSize: 16,
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
