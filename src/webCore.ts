// type Params = {
//   url?: URL | string | null | undefined;
// };
// const core = () => {
//   const route = new Map();
//   const callback = (params: Params) => {
//     const { url } = params;
//     if (url) {
//       // match route & loader
//       // run final function
//     }
//   };
//   const register = () => {
//     console.log("register", route);
//   };
//   return {
//     register,
//     callback,
//   };
// };

// const browser = (callback) => {
//   const history = window.history;
//   const mount = () => {
//     const listener = () => {
//       callback({ url: location.href });
//     };
//     window.addEventListener("load", listener);
//     window.addEventListener("popstate", listener);
//   };
//   mount();
//   return {
//     push: (params: Params) => {
//       const { url } = params;
//       history.pushState(null, "", url);
//       callback({ url });
//     },
//   };
// };

// const memory = (callback) => {
//   const history = {};
//   const mount = () => {
//     const listener = () => {
//       callback({ url: location.href });
//     };
//     globalThis.addEventListener("load", listener);
//     globalThis.addEventListener("popstate", listener);
//   };
//   return {
//     push: (params: Params) => {},
//   };
// };

// const createBrowserRouter = () => {
//   const { register, callback } = core();
//   const { push } = browser(callback);

//   const nav = (url?: Params["url"]) => push({ url });

//   return {
//     register,
//     nav,
//   };
// };
