import express from 'express';
import axios from 'axios';
const router = express.Router();

router.get('/login', async (req, res, next) => {
  try {
    const { data } = await axios.post(
      'https://dev-z5aj5eewyq3duaqc.us.auth0.com/oauth/token',
      {
        client_id: 'eW7bfGKjfMoKlIVRiuev2ehC7Boy5XUd',
        client_secret:
          'REDgfT-NsYPiVXrj4kfx4eYw5F0BjaSbpovRfYwK5caX_eVb4_5LwVbqxH-MEiio',
        audience: 'e-comPB',
        grant_type: 'client_credentials',
      },
      { headers: { 'content-type': 'application/json' } }
    );

    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
});
// router.get('/login', async (req, res, next) => {
//   try {
//     const { data } = await axios.post(
//       'https://dev-3nurd80vhso7rxtr.us.auth0.com/oauth/token',
//       {
//         client_id: 'vrf63x8WdTTChYHTEcdP6n79ciqpxPK8',
//         client_secret:
//           'h_HW63aY0BsKtZasU3Yoju_AXp4NBldAksQ3Lh-q5Kcl2z7sQah1XRbVfBXiwjGo',
//         audience: 'e-com',
//         grant_type: 'client_credentials',
//       },
//       { headers: { 'content-type': 'application/json' } }
//     );

//     res.status(200).json(data);
//   } catch (err) {
//     next(err);
//   }
// });

export default router;
