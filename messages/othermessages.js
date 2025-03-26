const middlewares = {
  //messages for the authmiddleware
  authmiddlewareA: "Token not found",
  authmiddlewareB: "User is logged out, access denied",
  authmiddlewareC: "Invalid or expired token",

  //messages for the rolemiddleware
  rolemiddlewareA: "User role not having the permissions to do",
};

const constenums = {
  // messages for the enumsconstants
  enumsmessagesA:
    "Role not found, give a valid role while registering,roles:{user,admin}",
  enumsmessagesB: "Error in role authentication",
};

export const othermessages = {
  middlewares,
  constenums,
};
