import { extractUser } from '../_lib/auth.js';

export default async function handler(req: any, res: any) {
  const user = await extractUser(req);
  if (!user) {
    res.status(200).json({ user: null });
    return;
  }
  res.status(200).json({ user: { login: user.id, avatarUrl: '', email: undefined } });
}
