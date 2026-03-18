export const runtime = 'edge'

interface Env {
  REMOVE_BG_API_KEY?: string
}

export async function POST(request: Request, { env }: { env: Env }) {
  const apiKey = env.REMOVE_BG_API_KEY || process.env.REMOVE_BG_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'API key not configured' }, { status: 500 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  const file = formData.get('image') as File | null
  if (!file) {
    return Response.json({ error: 'No image provided' }, { status: 400 })
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return Response.json({ error: 'Unsupported file format', code: 'INVALID_FILE' }, { status: 400 })
  }

  if (file.size > 5 * 1024 * 1024) {
    return Response.json({ error: 'File exceeds 5MB limit', code: 'FILE_TOO_LARGE' }, { status: 400 })
  }

  const body = new FormData()
  body.append('image_file', file)
  body.append('size', 'auto')

  let res: Response
  try {
    res = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: { 'X-Api-Key': apiKey },
      body,
    })
  } catch {
    return Response.json({ error: 'Request to remove.bg timed out', code: 'TIMEOUT' }, { status: 504 })
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    console.error('remove.bg error:', res.status, text)
    return Response.json({ error: 'Background removal failed', code: 'API_ERROR' }, { status: 502 })
  }

  return new Response(res.body, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'no-store',
    },
  })
}
