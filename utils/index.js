import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
  const accessToken = jwt.sign(
    {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      password: user.password,
    },
    process.env.TOKEN_SECRET,
    {
      expiresIn: '5h',
    }
  );

  const refeshToken = jwt.sign(
    {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      password: user.password,
    },
    process.env.REFESH_TOKEN_SECRET,
    {
      expiresIn: '1days',
    }
  );

  return {
    accessToken,
    refeshToken,
  };
};

export const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (authorization) {
    const token = authorization.slice(1, authorization.length - 1);
    jwt.verify(token, process.env.TOKEN_SECRET || 'buisyson', (err, decode) => {
      if (err) {
        res.status(400).send({ message: 'invalid token' });
      } else {
        req.user = decode;
        next();
      }
    });
  } else {
    res.status(401).send({ message: 'no token' });
  }
};
