var Ea,Ta,ba,Aa,wa,Ra,Ca,Pa,La;var qr=1e3,nn=1001,Yr=1002,Et=1003,Co=1004,Po=1005,Lt=1006,Lo=1007,es=1008,fn=1009,Io=1010,Do=1011,Ia=1012,Uo=1013,yn=1014,xi=1015,pn=1016,Da=1017,Ua=1018,Na=1020,No=35902,Oo=35899,Fo=1021,Bo=1022,_i=1023,vi=1026,Oa=1027,Fa=1028,Ba=1029,ir=1030,za=1031,Va=1033,zo=33776,Vo=33777,Go=33778,Ho=33779,ko=35840,Wo=35841,Xo=35842,qo=35843,Yo=36196,Ko=37492,Zo=37496,Jo=37488,$o=37489,Qo=37490,jo=37491,el=37808,tl=37809,nl=37810,il=37811,rl=37812,sl=37813,al=37814,ol=37815,ll=37816,cl=37817,hl=37818,ul=37819,dl=37820,fl=37821,pl=36492,ml=36494,gl=36495,_l=36283,vl=36284,Ml=36285,Sl=36286,rr=2300,Kr=2301,mr=2302,vs=2303,Ms=2400,Ss=2401,xs=2402,xl=3200;var zt="srgb",Zr="srgb-linear",sr="linear",ar="srgb",gr=7680;var yl=35044;var Qn=2e3;function El(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function Tl(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function or(e){return document.createElementNS("http://www.w3.org/1999/xhtml",e)}function bl(){const e=or("canvas");return e.style.display="block",e}var ys={},jn=null;function Es(...e){const t="THREE."+e.shift();jn?jn("log",t,...e):console.log(t,...e)}function Ga(e){const t=e[0];if(typeof t=="string"&&t.startsWith("TSL:")){const n=e[1];n&&n.isStackTrace?e[0]+=" "+n.getLocation():e[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return e}function be(...e){e=Ga(e);const t="THREE."+e.shift();if(jn)jn("warn",t,...e);else{const n=e[0];n&&n.isStackTrace?console.warn(n.getError(t)):console.warn(t,...e)}}function Ce(...e){e=Ga(e);const t="THREE."+e.shift();if(jn)jn("error",t,...e);else{const n=e[0];n&&n.isStackTrace?console.error(n.getError(t)):console.error(t,...e)}}function Jn(...e){const t=e.join(" ");t in ys||(ys[t]=!0,be(...e))}function Al(e,t,n){return new Promise(function(i,r){function s(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:r();break;case e.TIMEOUT_EXPIRED:setTimeout(s,n);break;default:i()}}setTimeout(s,n)})}var wl={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3},Tn=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){const n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){const n=this._listeners;if(n===void 0)return;const i=n[e];if(i!==void 0){const r=i.indexOf(t);r!==-1&&i.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const n=t[e.type];if(n!==void 0){e.target=this;const i=n.slice(0);for(let r=0,s=i.length;r<s;r++)i[r].call(this,e);e.target=null}}},vt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Ts=1234567,mi=Math.PI/180,Mi=180/Math.PI;function ti(){const e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(vt[e&255]+vt[e>>8&255]+vt[e>>16&255]+vt[e>>24&255]+"-"+vt[t&255]+vt[t>>8&255]+"-"+vt[t>>16&15|64]+vt[t>>24&255]+"-"+vt[n&63|128]+vt[n>>8&255]+"-"+vt[n>>16&255]+vt[n>>24&255]+vt[i&255]+vt[i>>8&255]+vt[i>>16&255]+vt[i>>24&255]).toLowerCase()}function Be(e,t,n){return Math.max(t,Math.min(n,e))}function ts(e,t){return(e%t+t)%t}function Rl(e,t,n,i,r){return i+(e-t)*(r-i)/(n-t)}function Cl(e,t,n){return e!==t?(n-e)/(t-e):0}function gi(e,t,n){return(1-n)*e+n*t}function Pl(e,t,n,i){return gi(e,t,1-Math.exp(-n*i))}function Ll(e,t=1){return t-Math.abs(ts(e,t*2)-t)}function Il(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*(3-2*e))}function Dl(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*e*(e*(e*6-15)+10))}function Ul(e,t){return e+Math.floor(Math.random()*(t-e+1))}function Nl(e,t){return e+Math.random()*(t-e)}function Ol(e){return e*(.5-Math.random())}function Fl(e){e!==void 0&&(Ts=e);let t=Ts+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function Bl(e){return e*mi}function zl(e){return e*Mi}function Vl(e){return e>0&&Number.isInteger(e)&&2**Math.round(Math.log2(e))===e}function Gl(e){return Math.pow(2,Math.ceil(Math.log(e)/Math.LN2))}function Hl(e){return Math.pow(2,Math.floor(Math.log(e)/Math.LN2))}function kl(e,t,n,i,r){const s=Math.cos,a=Math.sin,o=s(n/2),c=a(n/2),l=s((t+i)/2),u=a((t+i)/2),f=s((t-i)/2),h=a((t-i)/2),p=s((i-t)/2),M=a((i-t)/2);switch(r){case"XYX":e.set(o*u,c*f,c*h,o*l);break;case"YZY":e.set(c*h,o*u,c*f,o*l);break;case"ZXZ":e.set(c*f,c*h,o*u,o*l);break;case"XZX":e.set(o*u,c*M,c*p,o*l);break;case"YXY":e.set(c*p,o*u,c*M,o*l);break;case"ZYZ":e.set(c*M,c*p,o*u,o*l);break;default:be("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+r)}}function qn(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:case Uint8ClampedArray:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function xt(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var Md={DEG2RAD:mi,RAD2DEG:Mi,generateUUID:ti,clamp:Be,euclideanModulo:ts,mapLinear:Rl,inverseLerp:Cl,lerp:gi,damp:Pl,pingpong:Ll,smoothstep:Il,smootherstep:Dl,randInt:Ul,randFloat:Nl,randFloatSpread:Ol,seededRandom:Fl,degToRad:Bl,radToDeg:zl,isPowerOfTwo:Vl,ceilPowerOfTwo:Gl,floorPowerOfTwo:Hl,setQuaternionFromProperEuler:kl,normalize:xt,denormalize:qn};Ca=Symbol.iterator;var ze=class{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Be(this.x,e.x,t.x),this.y=Be(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Be(this.x,e,t),this.y=Be(this.y,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Be(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Be(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),i=Math.sin(t),r=this.x-e.x,s=this.y-e.y;return this.x=r*n-s*i+e.x,this.y=r*i+s*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Ca](){yield this.x,yield this.y}};Ea=ze;Ea.prototype.isVector2=!0;var bn=class{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,r,s,a){let o=n[i+0],c=n[i+1],l=n[i+2],u=n[i+3],f=r[s+0],h=r[s+1],p=r[s+2],M=r[s+3];if(u!==M||o!==f||c!==h||l!==p){let y=o*f+c*h+l*p+u*M;y<0&&(f=-f,h=-h,p=-p,M=-M,y=-y);let g=1-a;if(y<.9995){const d=Math.acos(y),A=Math.sin(d);g=Math.sin(g*d)/A,a=Math.sin(a*d)/A,o=o*g+f*a,c=c*g+h*a,l=l*g+p*a,u=u*g+M*a}else{o=o*g+f*a,c=c*g+h*a,l=l*g+p*a,u=u*g+M*a;const d=1/Math.sqrt(o*o+c*c+l*l+u*u);o*=d,c*=d,l*=d,u*=d}}e[t]=o,e[t+1]=c,e[t+2]=l,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,i,r,s){const a=n[i],o=n[i+1],c=n[i+2],l=n[i+3],u=r[s],f=r[s+1],h=r[s+2],p=r[s+3];return e[t]=a*p+l*u+o*h-c*f,e[t+1]=o*p+l*f+c*u-a*h,e[t+2]=c*p+l*h+a*f-o*u,e[t+3]=l*p-a*u-o*f-c*h,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,i=e._y,r=e._z,s=e._order,a=Math.cos,o=Math.sin,c=a(n/2),l=a(i/2),u=a(r/2),f=o(n/2),h=o(i/2),p=o(r/2);switch(s){case"XYZ":this._x=f*l*u+c*h*p,this._y=c*h*u-f*l*p,this._z=c*l*p+f*h*u,this._w=c*l*u-f*h*p;break;case"YXZ":this._x=f*l*u+c*h*p,this._y=c*h*u-f*l*p,this._z=c*l*p-f*h*u,this._w=c*l*u+f*h*p;break;case"ZXY":this._x=f*l*u-c*h*p,this._y=c*h*u+f*l*p,this._z=c*l*p+f*h*u,this._w=c*l*u-f*h*p;break;case"ZYX":this._x=f*l*u-c*h*p,this._y=c*h*u+f*l*p,this._z=c*l*p-f*h*u,this._w=c*l*u+f*h*p;break;case"YZX":this._x=f*l*u+c*h*p,this._y=c*h*u+f*l*p,this._z=c*l*p-f*h*u,this._w=c*l*u-f*h*p;break;case"XZY":this._x=f*l*u-c*h*p,this._y=c*h*u-f*l*p,this._z=c*l*p+f*h*u,this._w=c*l*u+f*h*p;break;default:be("Quaternion: .setFromEuler() encountered an unknown order: "+s)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],i=t[4],r=t[8],s=t[1],a=t[5],o=t[9],c=t[2],l=t[6],u=t[10],f=n+a+u;if(f>0){const h=.5/Math.sqrt(f+1);this._w=.25/h,this._x=(l-o)*h,this._y=(r-c)*h,this._z=(s-i)*h}else if(n>a&&n>u){const h=2*Math.sqrt(1+n-a-u);this._w=(l-o)/h,this._x=.25*h,this._y=(i+s)/h,this._z=(r+c)/h}else if(a>u){const h=2*Math.sqrt(1+a-n-u);this._w=(r-c)/h,this._x=(i+s)/h,this._y=.25*h,this._z=(o+l)/h}else{const h=2*Math.sqrt(1+u-n-a);this._w=(s-i)/h,this._x=(r+c)/h,this._y=(o+l)/h,this._z=.25*h}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Be(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,i=e._y,r=e._z,s=e._w,a=t._x,o=t._y,c=t._z,l=t._w;return this._x=n*l+s*a+i*c-r*o,this._y=i*l+s*o+r*a-n*c,this._z=r*l+s*c+n*o-i*a,this._w=s*l-n*a-i*o-r*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,i=e._y,r=e._z,s=e._w,a=this.dot(e);a<0&&(n=-n,i=-i,r=-r,s=-s,a=-a);let o=1-t;if(a<.9995){const c=Math.acos(a),l=Math.sin(c);o=Math.sin(o*c)/l,t=Math.sin(t*c)/l,this._x=this._x*o+n*t,this._y=this._y*o+i*t,this._z=this._z*o+r*t,this._w=this._w*o+s*t,this._onChangeCallback()}else this._x=this._x*o+n*t,this._y=this._y*o+i*t,this._z=this._z*o+r*t,this._w=this._w*o+s*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(i*Math.sin(e),i*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}};Pa=Symbol.iterator;var B=class{constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(bs.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(bs.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*i,this.y=r[1]*t+r[4]*n+r[7]*i,this.z=r[2]*t+r[5]*n+r[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,r=e.elements,s=1/(r[3]*t+r[7]*n+r[11]*i+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*i+r[12])*s,this.y=(r[1]*t+r[5]*n+r[9]*i+r[13])*s,this.z=(r[2]*t+r[6]*n+r[10]*i+r[14])*s,this}applyQuaternion(e){const t=this.x,n=this.y,i=this.z,r=e.x,s=e.y,a=e.z,o=e.w,c=2*(s*i-a*n),l=2*(a*t-r*i),u=2*(r*n-s*t);return this.x=t+o*c+s*u-a*l,this.y=n+o*l+a*c-r*u,this.z=i+o*u+r*l-s*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*i,this.y=r[1]*t+r[5]*n+r[9]*i,this.z=r[2]*t+r[6]*n+r[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Be(this.x,e.x,t.x),this.y=Be(this.y,e.y,t.y),this.z=Be(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Be(this.x,e,t),this.y=Be(this.y,e,t),this.z=Be(this.z,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Be(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,i=e.y,r=e.z,s=t.x,a=t.y,o=t.z;return this.x=i*o-r*a,this.y=r*s-n*o,this.z=n*a-i*s,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return _r.copy(this).projectOnVector(e),this.sub(_r)}reflect(e){return this.sub(_r.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Be(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Pa](){yield this.x,yield this.y,yield this.z}};Ta=B;Ta.prototype.isVector3=!0;var _r=new B,bs=new bn,Ie=class{constructor(e,t,n,i,r,s,a,o,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,i,r,s,a,o,c)}set(e,t,n,i,r,s,a,o,c){const l=this.elements;return l[0]=e,l[1]=i,l[2]=a,l[3]=t,l[4]=r,l[5]=o,l[6]=n,l[7]=s,l[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,r=this.elements,s=n[0],a=n[3],o=n[6],c=n[1],l=n[4],u=n[7],f=n[2],h=n[5],p=n[8],M=i[0],y=i[3],g=i[6],d=i[1],A=i[4],I=i[7],x=i[2],T=i[5],b=i[8];return r[0]=s*M+a*d+o*x,r[3]=s*y+a*A+o*T,r[6]=s*g+a*I+o*b,r[1]=c*M+l*d+u*x,r[4]=c*y+l*A+u*T,r[7]=c*g+l*I+u*b,r[2]=f*M+h*d+p*x,r[5]=f*y+h*A+p*T,r[8]=f*g+h*I+p*b,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],s=e[4],a=e[5],o=e[6],c=e[7],l=e[8];return t*s*l-t*a*c-n*r*l+n*a*o+i*r*c-i*s*o}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],s=e[4],a=e[5],o=e[6],c=e[7],l=e[8],u=l*s-a*c,f=a*o-l*r,h=c*r-s*o,p=t*u+n*f+i*h;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);const M=1/p;return e[0]=u*M,e[1]=(i*c-l*n)*M,e[2]=(a*n-i*s)*M,e[3]=f*M,e[4]=(l*t-i*o)*M,e[5]=(i*r-a*t)*M,e[6]=h*M,e[7]=(n*o-c*t)*M,e[8]=(s*t-n*r)*M,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,r,s,a){const o=Math.cos(r),c=Math.sin(r);return this.set(n*o,n*c,-n*(o*s+c*a)+s+e,-i*c,i*o,-i*(-c*s+o*a)+a+t,0,0,1),this}scale(e,t){return Jn("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(vr.makeScale(e,t)),this}rotate(e){return Jn("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(vr.makeRotation(-e)),this}translate(e,t){return Jn("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(vr.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}};ba=Ie;ba.prototype.isMatrix3=!0;var vr=new Ie,As=new Ie().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),ws=new Ie().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Wl(){const e={enabled:!0,workingColorSpace:Zr,spaces:{},convert:function(r,s,a){return this.enabled===!1||s===a||!s||!a||(this.spaces[s].transfer==="srgb"&&(r.r=rn(r.r),r.g=rn(r.g),r.b=rn(r.b)),this.spaces[s].primaries!==this.spaces[a].primaries&&(r.applyMatrix3(this.spaces[s].toXYZ),r.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer==="srgb"&&(r.r=$n(r.r),r.g=$n(r.g),r.b=$n(r.b))),r},workingToColorSpace:function(r,s){return this.convert(r,this.workingColorSpace,s)},colorSpaceToWorking:function(r,s){return this.convert(r,s,this.workingColorSpace)},getPrimaries:function(r){return this.spaces[r].primaries},getTransfer:function(r){return r===""?sr:this.spaces[r].transfer},getToneMappingMode:function(r){return this.spaces[r].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(r,s=this.workingColorSpace){return r.fromArray(this.spaces[s].luminanceCoefficients)},define:function(r){Object.assign(this.spaces,r)},_getMatrix:function(r,s,a){return r.copy(this.spaces[s].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(r){return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(r=this.workingColorSpace){return this.spaces[r].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(r,s){return Jn("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),e.workingToColorSpace(r,s)},toWorkingColorSpace:function(r,s){return Jn("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),e.colorSpaceToWorking(r,s)}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],i=[.3127,.329];return e.define({[Zr]:{primaries:t,whitePoint:i,transfer:sr,toXYZ:As,fromXYZ:ws,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:zt},outputColorSpaceConfig:{drawingBufferColorSpace:zt}},[zt]:{primaries:t,whitePoint:i,transfer:ar,toXYZ:As,fromXYZ:ws,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:zt}}}),e}var Ge=Wl();function rn(e){return e<.04045?e*.0773993808:Math.pow(e*.9478672986+.0521327014,2.4)}function $n(e){return e<.0031308?e*12.92:1.055*Math.pow(e,.41666)-.055}var Pn,Xl=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Pn===void 0&&(Pn=or("canvas")),Pn.width=e.width,Pn.height=e.height;const i=Pn.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),n=Pn}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=or("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const i=n.getImageData(0,0,e.width,e.height),r=i.data;for(let s=0;s<r.length;s++)r[s]=rn(r[s]/255)*255;return n.putImageData(i,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(rn(t[n]/255)*255):t[n]=rn(t[n]);return{data:t,width:e.width,height:e.height}}else return be("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},ql=0,ns=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:ql++}),this.uuid=ti(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let r;if(Array.isArray(i)){r=[];for(let s=0,a=i.length;s<a;s++)i[s].isDataTexture?r.push(Mr(i[s].image)):r.push(Mr(i[s]))}else r=Mr(i);n.url=r}return t||(e.images[this.uuid]=n),n}};function Mr(e){return typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap?Xl.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(be("Texture: Unable to serialize Texture."),{})}var Yl=0,Sr=new B,Gt=class er extends Tn{constructor(t=er.DEFAULT_IMAGE,n=er.DEFAULT_MAPPING,i=nn,r=nn,s=Lt,a=es,o=_i,c=fn,l=er.DEFAULT_ANISOTROPY,u=""){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Yl++}),this.uuid=ti(),this.name="",this.source=new ns(t),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=i,this.wrapT=r,this.magFilter=s,this.minFilter=a,this.anisotropy=l,this.format=o,this.internalFormat=null,this.type=c,this.offset=new ze(0,0),this.repeat=new ze(1,1),this.center=new ze(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ie,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Sr).x}get height(){return this.source.getSize(Sr).y}get depth(){return this.source.getSize(Sr).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,n){this.updateRanges.push({start:t,count:n})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(const n in t){const i=t[n];if(i===void 0){be(`Texture.setValues(): parameter '${n}' has value of undefined.`);continue}const r=this[n];if(r===void 0){be(`Texture.setValues(): property '${n}' does not exist.`);continue}r&&i&&r.isVector2&&i.isVector2||r&&i&&r.isVector3&&i.isVector3||r&&i&&r.isMatrix3&&i.isMatrix3?r.copy(i):this[n]=i}}toJSON(t){const n=t===void 0||typeof t=="string";if(!n&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),n||(t.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==300)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case qr:t.x=t.x-Math.floor(t.x);break;case nn:t.x=t.x<0?0:1;break;case Yr:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x)}if(t.y<0||t.y>1)switch(this.wrapT){case qr:t.y=t.y-Math.floor(t.y);break;case nn:t.y=t.y<0?0:1;break;case Yr:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y)}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};Gt.DEFAULT_IMAGE=null;Gt.DEFAULT_MAPPING=300;Gt.DEFAULT_ANISOTROPY=1;La=Symbol.iterator;var rt=class{constructor(e=0,t=0,n=0,i=1){this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,r=this.w,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*i+s[12]*r,this.y=s[1]*t+s[5]*n+s[9]*i+s[13]*r,this.z=s[2]*t+s[6]*n+s[10]*i+s[14]*r,this.w=s[3]*t+s[7]*n+s[11]*i+s[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,i,r;const o=e.elements,c=o[0],l=o[4],u=o[8],f=o[1],h=o[5],p=o[9],M=o[2],y=o[6],g=o[10];if(Math.abs(l-f)<.01&&Math.abs(u-M)<.01&&Math.abs(p-y)<.01){if(Math.abs(l+f)<.1&&Math.abs(u+M)<.1&&Math.abs(p+y)<.1&&Math.abs(c+h+g-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const A=(c+1)/2,I=(h+1)/2,x=(g+1)/2,T=(l+f)/4,b=(u+M)/4,w=(p+y)/4;return A>I&&A>x?A<.01?(n=0,i=.707106781,r=.707106781):(n=Math.sqrt(A),i=T/n,r=b/n):I>x?I<.01?(n=.707106781,i=0,r=.707106781):(i=Math.sqrt(I),n=T/i,r=w/i):x<.01?(n=.707106781,i=.707106781,r=0):(r=Math.sqrt(x),n=b/r,i=w/r),this.set(n,i,r,t),this}let d=Math.sqrt((y-p)*(y-p)+(u-M)*(u-M)+(f-l)*(f-l));return Math.abs(d)<.001&&(d=1),this.x=(y-p)/d,this.y=(u-M)/d,this.z=(f-l)/d,this.w=Math.acos((c+h+g-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Be(this.x,e.x,t.x),this.y=Be(this.y,e.y,t.y),this.z=Be(this.z,e.z,t.z),this.w=Be(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Be(this.x,e,t),this.y=Be(this.y,e,t),this.z=Be(this.z,e,t),this.w=Be(this.w,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Be(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[La](){yield this.x,yield this.y,yield this.z,yield this.w}};Aa=rt;Aa.prototype.isVector4=!0;var Kl=class extends Tn{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Lt,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new rt(0,0,e,t),this.scissorTest=!1,this.viewport=new rt(0,0,e,t),this.textures=[];const i={width:e,height:t,depth:n.depth},r=new Gt(i),s=n.count;for(let a=0;a<s;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){const t={minFilter:Lt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let i=0,r=this.textures.length;i<r;i++)this.textures[i].image.width=e,this.textures[i].image.height=t,this.textures[i].image.depth=n,this.textures[i].isData3DTexture!==!0&&(this.textures[i].isArrayTexture=this.textures[i].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const i=Object.assign({},e.textures[t].image);this.textures[t].source=new ns(i)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){const t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Vt=class extends Kl{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Ha=class extends Gt{constructor(e=null,t=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=Et,this.minFilter=Et,this.wrapR=nn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},Zl=class extends Gt{constructor(e=null,t=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=Et,this.minFilter=Et,this.wrapR=nn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}},Qe=class ka{constructor(t,n,i,r,s,a,o,c,l,u,f,h,p,M,y,g){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,n,i,r,s,a,o,c,l,u,f,h,p,M,y,g)}set(t,n,i,r,s,a,o,c,l,u,f,h,p,M,y,g){const d=this.elements;return d[0]=t,d[4]=n,d[8]=i,d[12]=r,d[1]=s,d[5]=a,d[9]=o,d[13]=c,d[2]=l,d[6]=u,d[10]=f,d[14]=h,d[3]=p,d[7]=M,d[11]=y,d[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new ka().fromArray(this.elements)}copy(t){const n=this.elements,i=t.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],n[9]=i[9],n[10]=i[10],n[11]=i[11],n[12]=i[12],n[13]=i[13],n[14]=i[14],n[15]=i[15],this}copyPosition(t){const n=this.elements,i=t.elements;return n[12]=i[12],n[13]=i[13],n[14]=i[14],this}setFromMatrix3(t){const n=t.elements;return this.set(n[0],n[3],n[6],0,n[1],n[4],n[7],0,n[2],n[5],n[8],0,0,0,0,1),this}extractBasis(t,n,i){return this.determinantAffine()===0?(t.set(1,0,0),n.set(0,1,0),i.set(0,0,1),this):(t.setFromMatrixColumn(this,0),n.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(t,n,i){return this.set(t.x,n.x,i.x,0,t.y,n.y,i.y,0,t.z,n.z,i.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();const n=this.elements,i=t.elements,r=1/Ln.setFromMatrixColumn(t,0).length(),s=1/Ln.setFromMatrixColumn(t,1).length(),a=1/Ln.setFromMatrixColumn(t,2).length();return n[0]=i[0]*r,n[1]=i[1]*r,n[2]=i[2]*r,n[3]=0,n[4]=i[4]*s,n[5]=i[5]*s,n[6]=i[6]*s,n[7]=0,n[8]=i[8]*a,n[9]=i[9]*a,n[10]=i[10]*a,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromEuler(t){const n=this.elements,i=t.x,r=t.y,s=t.z,a=Math.cos(i),o=Math.sin(i),c=Math.cos(r),l=Math.sin(r),u=Math.cos(s),f=Math.sin(s);if(t.order==="XYZ"){const h=a*u,p=a*f,M=o*u,y=o*f;n[0]=c*u,n[4]=-c*f,n[8]=l,n[1]=p+M*l,n[5]=h-y*l,n[9]=-o*c,n[2]=y-h*l,n[6]=M+p*l,n[10]=a*c}else if(t.order==="YXZ"){const h=c*u,p=c*f,M=l*u,y=l*f;n[0]=h+y*o,n[4]=M*o-p,n[8]=a*l,n[1]=a*f,n[5]=a*u,n[9]=-o,n[2]=p*o-M,n[6]=y+h*o,n[10]=a*c}else if(t.order==="ZXY"){const h=c*u,p=c*f,M=l*u,y=l*f;n[0]=h-y*o,n[4]=-a*f,n[8]=M+p*o,n[1]=p+M*o,n[5]=a*u,n[9]=y-h*o,n[2]=-a*l,n[6]=o,n[10]=a*c}else if(t.order==="ZYX"){const h=a*u,p=a*f,M=o*u,y=o*f;n[0]=c*u,n[4]=M*l-p,n[8]=h*l+y,n[1]=c*f,n[5]=y*l+h,n[9]=p*l-M,n[2]=-l,n[6]=o*c,n[10]=a*c}else if(t.order==="YZX"){const h=a*c,p=a*l,M=o*c,y=o*l;n[0]=c*u,n[4]=y-h*f,n[8]=M*f+p,n[1]=f,n[5]=a*u,n[9]=-o*u,n[2]=-l*u,n[6]=p*f+M,n[10]=h-y*f}else if(t.order==="XZY"){const h=a*c,p=a*l,M=o*c,y=o*l;n[0]=c*u,n[4]=-f,n[8]=l*u,n[1]=h*f+y,n[5]=a*u,n[9]=p*f-M,n[2]=M*f-p,n[6]=o*u,n[10]=y*f+h}return n[3]=0,n[7]=0,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Jl,t,$l)}lookAt(t,n,i){const r=this.elements;return Ct.subVectors(t,n),Ct.lengthSq()===0&&(Ct.z=1),Ct.normalize(),on.crossVectors(i,Ct),on.lengthSq()===0&&(Math.abs(i.z)===1?Ct.x+=1e-4:Ct.z+=1e-4,Ct.normalize(),on.crossVectors(i,Ct)),on.normalize(),wi.crossVectors(Ct,on),r[0]=on.x,r[4]=wi.x,r[8]=Ct.x,r[1]=on.y,r[5]=wi.y,r[9]=Ct.y,r[2]=on.z,r[6]=wi.z,r[10]=Ct.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,n){const i=t.elements,r=n.elements,s=this.elements,a=i[0],o=i[4],c=i[8],l=i[12],u=i[1],f=i[5],h=i[9],p=i[13],M=i[2],y=i[6],g=i[10],d=i[14],A=i[3],I=i[7],x=i[11],T=i[15],b=r[0],w=r[4],_=r[8],E=r[12],G=r[1],U=r[5],O=r[9],Y=r[13],D=r[2],V=r[6],J=r[10],H=r[14],oe=r[3],X=r[7],K=r[11],$=r[15];return s[0]=a*b+o*G+c*D+l*oe,s[4]=a*w+o*U+c*V+l*X,s[8]=a*_+o*O+c*J+l*K,s[12]=a*E+o*Y+c*H+l*$,s[1]=u*b+f*G+h*D+p*oe,s[5]=u*w+f*U+h*V+p*X,s[9]=u*_+f*O+h*J+p*K,s[13]=u*E+f*Y+h*H+p*$,s[2]=M*b+y*G+g*D+d*oe,s[6]=M*w+y*U+g*V+d*X,s[10]=M*_+y*O+g*J+d*K,s[14]=M*E+y*Y+g*H+d*$,s[3]=A*b+I*G+x*D+T*oe,s[7]=A*w+I*U+x*V+T*X,s[11]=A*_+I*O+x*J+T*K,s[15]=A*E+I*Y+x*H+T*$,this}multiplyScalar(t){const n=this.elements;return n[0]*=t,n[4]*=t,n[8]*=t,n[12]*=t,n[1]*=t,n[5]*=t,n[9]*=t,n[13]*=t,n[2]*=t,n[6]*=t,n[10]*=t,n[14]*=t,n[3]*=t,n[7]*=t,n[11]*=t,n[15]*=t,this}determinant(){const t=this.elements,n=t[0],i=t[4],r=t[8],s=t[12],a=t[1],o=t[5],c=t[9],l=t[13],u=t[2],f=t[6],h=t[10],p=t[14],M=t[3],y=t[7],g=t[11],d=t[15],A=c*p-l*h,I=o*p-l*f,x=o*h-c*f,T=a*p-l*u,b=a*h-c*u,w=a*f-o*u;return n*(y*A-g*I+d*x)-i*(M*A-g*T+d*b)+r*(M*I-y*T+d*w)-s*(M*x-y*b+g*w)}determinantAffine(){const t=this.elements,n=t[0],i=t[4],r=t[8],s=t[1],a=t[5],o=t[9],c=t[2],l=t[6],u=t[10];return n*(a*u-o*l)-i*(s*u-o*c)+r*(s*l-a*c)}transpose(){const t=this.elements;let n;return n=t[1],t[1]=t[4],t[4]=n,n=t[2],t[2]=t[8],t[8]=n,n=t[6],t[6]=t[9],t[9]=n,n=t[3],t[3]=t[12],t[12]=n,n=t[7],t[7]=t[13],t[13]=n,n=t[11],t[11]=t[14],t[14]=n,this}setPosition(t,n,i){const r=this.elements;return t.isVector3?(r[12]=t.x,r[13]=t.y,r[14]=t.z):(r[12]=t,r[13]=n,r[14]=i),this}invert(){const t=this.elements,n=t[0],i=t[1],r=t[2],s=t[3],a=t[4],o=t[5],c=t[6],l=t[7],u=t[8],f=t[9],h=t[10],p=t[11],M=t[12],y=t[13],g=t[14],d=t[15],A=n*o-i*a,I=n*c-r*a,x=n*l-s*a,T=i*c-r*o,b=i*l-s*o,w=r*l-s*c,_=u*y-f*M,E=u*g-h*M,G=u*d-p*M,U=f*g-h*y,O=f*d-p*y,Y=h*d-p*g,D=A*Y-I*O+x*U+T*G-b*E+w*_;if(D===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const V=1/D;return t[0]=(o*Y-c*O+l*U)*V,t[1]=(r*O-i*Y-s*U)*V,t[2]=(y*w-g*b+d*T)*V,t[3]=(h*b-f*w-p*T)*V,t[4]=(c*G-a*Y-l*E)*V,t[5]=(n*Y-r*G+s*E)*V,t[6]=(g*x-M*w-d*I)*V,t[7]=(u*w-h*x+p*I)*V,t[8]=(a*O-o*G+l*_)*V,t[9]=(i*G-n*O-s*_)*V,t[10]=(M*b-y*x+d*A)*V,t[11]=(f*x-u*b-p*A)*V,t[12]=(o*E-a*U-c*_)*V,t[13]=(n*U-i*E+r*_)*V,t[14]=(y*I-M*T-g*A)*V,t[15]=(u*T-f*I+h*A)*V,this}scale(t){const n=this.elements,i=t.x,r=t.y,s=t.z;return n[0]*=i,n[4]*=r,n[8]*=s,n[1]*=i,n[5]*=r,n[9]*=s,n[2]*=i,n[6]*=r,n[10]*=s,n[3]*=i,n[7]*=r,n[11]*=s,this}getMaxScaleOnAxis(){const t=this.elements,n=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],i=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],r=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(n,i,r))}makeTranslation(t,n,i){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,n,0,0,1,i,0,0,0,1),this}makeRotationX(t){const n=Math.cos(t),i=Math.sin(t);return this.set(1,0,0,0,0,n,-i,0,0,i,n,0,0,0,0,1),this}makeRotationY(t){const n=Math.cos(t),i=Math.sin(t);return this.set(n,0,i,0,0,1,0,0,-i,0,n,0,0,0,0,1),this}makeRotationZ(t){const n=Math.cos(t),i=Math.sin(t);return this.set(n,-i,0,0,i,n,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,n){const i=Math.cos(n),r=Math.sin(n),s=1-i,a=t.x,o=t.y,c=t.z,l=s*a,u=s*o;return this.set(l*a+i,l*o-r*c,l*c+r*o,0,l*o+r*c,u*o+i,u*c-r*a,0,l*c-r*o,u*c+r*a,s*c*c+i,0,0,0,0,1),this}makeScale(t,n,i){return this.set(t,0,0,0,0,n,0,0,0,0,i,0,0,0,0,1),this}makeShear(t,n,i,r,s,a){return this.set(1,i,s,0,t,1,a,0,n,r,1,0,0,0,0,1),this}compose(t,n,i){const r=this.elements,s=n._x,a=n._y,o=n._z,c=n._w,l=s+s,u=a+a,f=o+o,h=s*l,p=s*u,M=s*f,y=a*u,g=a*f,d=o*f,A=c*l,I=c*u,x=c*f,T=i.x,b=i.y,w=i.z;return r[0]=(1-(y+d))*T,r[1]=(p+x)*T,r[2]=(M-I)*T,r[3]=0,r[4]=(p-x)*b,r[5]=(1-(h+d))*b,r[6]=(g+A)*b,r[7]=0,r[8]=(M+I)*w,r[9]=(g-A)*w,r[10]=(1-(h+y))*w,r[11]=0,r[12]=t.x,r[13]=t.y,r[14]=t.z,r[15]=1,this}decompose(t,n,i){const r=this.elements;t.x=r[12],t.y=r[13],t.z=r[14];const s=this.determinantAffine();if(s===0)return i.set(1,1,1),n.identity(),this;let a=Ln.set(r[0],r[1],r[2]).length();const o=Ln.set(r[4],r[5],r[6]).length(),c=Ln.set(r[8],r[9],r[10]).length();s<0&&(a=-a),Ot.copy(this);const l=1/a,u=1/o,f=1/c;return Ot.elements[0]*=l,Ot.elements[1]*=l,Ot.elements[2]*=l,Ot.elements[4]*=u,Ot.elements[5]*=u,Ot.elements[6]*=u,Ot.elements[8]*=f,Ot.elements[9]*=f,Ot.elements[10]*=f,n.setFromRotationMatrix(Ot),i.x=a,i.y=o,i.z=c,this}makePerspective(t,n,i,r,s,a,o=Qn,c=!1){const l=this.elements,u=2*s/(n-t),f=2*s/(i-r),h=(n+t)/(n-t),p=(i+r)/(i-r);let M,y;if(c)M=s/(a-s),y=a*s/(a-s);else if(o===2e3)M=-(a+s)/(a-s),y=-2*a*s/(a-s);else if(o===2001)M=-a/(a-s),y=-a*s/(a-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=u,l[4]=0,l[8]=h,l[12]=0,l[1]=0,l[5]=f,l[9]=p,l[13]=0,l[2]=0,l[6]=0,l[10]=M,l[14]=y,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,n,i,r,s,a,o=Qn,c=!1){const l=this.elements,u=2/(n-t),f=2/(i-r),h=-(n+t)/(n-t),p=-(i+r)/(i-r);let M,y;if(c)M=1/(a-s),y=a/(a-s);else if(o===2e3)M=-2/(a-s),y=-(a+s)/(a-s);else if(o===2001)M=-1/(a-s),y=-s/(a-s);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=u,l[4]=0,l[8]=0,l[12]=h,l[1]=0,l[5]=f,l[9]=0,l[13]=p,l[2]=0,l[6]=0,l[10]=M,l[14]=y,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){const n=this.elements,i=t.elements;for(let r=0;r<16;r++)if(n[r]!==i[r])return!1;return!0}fromArray(t,n=0){for(let i=0;i<16;i++)this.elements[i]=t[i+n];return this}toArray(t=[],n=0){const i=this.elements;return t[n]=i[0],t[n+1]=i[1],t[n+2]=i[2],t[n+3]=i[3],t[n+4]=i[4],t[n+5]=i[5],t[n+6]=i[6],t[n+7]=i[7],t[n+8]=i[8],t[n+9]=i[9],t[n+10]=i[10],t[n+11]=i[11],t[n+12]=i[12],t[n+13]=i[13],t[n+14]=i[14],t[n+15]=i[15],t}};wa=Qe;wa.prototype.isMatrix4=!0;var Ln=new B,Ot=new Qe,Jl=new B(0,0,0),$l=new B(1,1,1),on=new B,wi=new B,Ct=new B,Rs=new Qe,Cs=new bn,En=class Wa{constructor(t=0,n=0,i=0,r=Wa.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=i,this._order=r}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,n,i,r=this._order){return this._x=t,this._y=n,this._z=i,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,n=this._order,i=!0){const r=t.elements,s=r[0],a=r[4],o=r[8],c=r[1],l=r[5],u=r[9],f=r[2],h=r[6],p=r[10];switch(n){case"XYZ":this._y=Math.asin(Be(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,p),this._z=Math.atan2(-a,s)):(this._x=Math.atan2(h,l),this._z=0);break;case"YXZ":this._x=Math.asin(-Be(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-f,s),this._z=0);break;case"ZXY":this._x=Math.asin(Be(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-f,p),this._z=Math.atan2(-a,l)):(this._y=0,this._z=Math.atan2(c,s));break;case"ZYX":this._y=Math.asin(-Be(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(h,p),this._z=Math.atan2(c,s)):(this._x=0,this._z=Math.atan2(-a,l));break;case"YZX":this._z=Math.asin(Be(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-u,l),this._y=Math.atan2(-f,s)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-Be(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(h,l),this._y=Math.atan2(o,s)):(this._x=Math.atan2(-u,p),this._y=0);break;default:be("Euler: .setFromRotationMatrix() encountered an unknown order: "+n)}return this._order=n,i===!0&&this._onChangeCallback(),this}setFromQuaternion(t,n,i){return Rs.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Rs,n,i)}setFromVector3(t,n=this._order){return this.set(t.x,t.y,t.z,n)}reorder(t){return Cs.setFromEuler(this),this.setFromQuaternion(Cs,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],n=0){return t[n]=this._x,t[n+1]=this._y,t[n+2]=this._z,t[n+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};En.DEFAULT_ORDER="XYZ";var Xa=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},Ql=0,Ps=new B,In=new bn,$t=new Qe,Ri=new B,ri=new B,jl=new B,ec=new bn,Ls=new B(1,0,0),Is=new B(0,1,0),Ds=new B(0,0,1),Us={type:"added"},tc={type:"removed"},Dn={type:"childadded",child:null},xr={type:"childremoved",child:null},Tt=class tr extends Tn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Ql++}),this.uuid=ti(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=tr.DEFAULT_UP.clone();const t=new B,n=new En,i=new bn,r=new B(1,1,1);function s(){i.setFromEuler(n,!1)}function a(){n.setFromQuaternion(i,void 0,!1)}n._onChange(s),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new Qe},normalMatrix:{value:new Ie}}),this.matrix=new Qe,this.matrixWorld=new Qe,this.matrixAutoUpdate=tr.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=tr.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Xa,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,n){this.quaternion.setFromAxisAngle(t,n)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,n){return In.setFromAxisAngle(t,n),this.quaternion.multiply(In),this}rotateOnWorldAxis(t,n){return In.setFromAxisAngle(t,n),this.quaternion.premultiply(In),this}rotateX(t){return this.rotateOnAxis(Ls,t)}rotateY(t){return this.rotateOnAxis(Is,t)}rotateZ(t){return this.rotateOnAxis(Ds,t)}translateOnAxis(t,n){return Ps.copy(t).applyQuaternion(this.quaternion),this.position.add(Ps.multiplyScalar(n)),this}translateX(t){return this.translateOnAxis(Ls,t)}translateY(t){return this.translateOnAxis(Is,t)}translateZ(t){return this.translateOnAxis(Ds,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4($t.copy(this.matrixWorld).invert())}lookAt(t,n,i){t.isVector3?Ri.copy(t):Ri.set(t,n,i);const r=this.parent;this.updateWorldMatrix(!0,!1),ri.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?$t.lookAt(ri,Ri,this.up):$t.lookAt(Ri,ri,this.up),this.quaternion.setFromRotationMatrix($t),r&&($t.extractRotation(r.matrixWorld),In.setFromRotationMatrix($t),this.quaternion.premultiply(In.invert()))}add(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.add(arguments[n]);return this}return t===this?(Ce("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Us),Dn.child=t,this.dispatchEvent(Dn),Dn.child=null):Ce("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const n=this.children.indexOf(t);return n!==-1&&(t.parent=null,this.children.splice(n,1),t.dispatchEvent(tc),xr.child=t,this.dispatchEvent(xr),xr.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),$t.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),$t.multiply(t.parent.matrixWorld)),t.applyMatrix4($t),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Us),Dn.child=t,this.dispatchEvent(Dn),Dn.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,n){if(this[t]===n)return this;for(let i=0,r=this.children.length;i<r;i++){const s=this.children[i].getObjectByProperty(t,n);if(s!==void 0)return s}}getObjectsByProperty(t,n,i=[]){this[t]===n&&i.push(this);const r=this.children;for(let s=0,a=r.length;s<a;s++)r[s].getObjectsByProperty(t,n,i);return i}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ri,t,jl),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ri,ec,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const n=this.matrixWorld.elements;return t.set(n[8],n[9],n[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(t){t(this);const n=this.children;for(let i=0,r=n.length;i<r;i++)n[i].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const n=this.children;for(let i=0,r=n.length;i<r;i++)n[i].traverseVisible(t)}traverseAncestors(t){const n=this.parent;n!==null&&(t(n),n.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const t=this.pivot;if(t!==null){const n=t.x,i=t.y,r=t.z,s=this.matrix.elements;s[12]+=n-s[0]*n-s[4]*i-s[8]*r,s[13]+=i-s[1]*n-s[5]*i-s[9]*r,s[14]+=r-s[2]*n-s[6]*i-s[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const n=this.children;for(let i=0,r=n.length;i<r;i++)n[i].updateMatrixWorld(t)}updateWorldMatrix(t,n,i=!1){const r=this.parent;if(t===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),n===!0){const s=this.children;for(let a=0,o=s.length;a<o;a++)s[a].updateWorldMatrix(!1,!0,i)}}toJSON(t){const n=t===void 0||typeof t=="string",i={};n&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const r={};r.uuid=this.uuid,r.type=this.type,r.name=this.name,r.castShadow=this.castShadow,r.receiveShadow=this.receiveShadow,r.visible=this.visible,r.frustumCulled=this.frustumCulled,r.renderOrder=this.renderOrder,r.static=this.static,r.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(o=>({...o})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(t),r.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function s(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(t)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(t.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const c=o.shapes;if(Array.isArray(c))for(let l=0,u=c.length;l<u;l++){const f=c[l];s(t.shapes,f)}else s(t.shapes,c)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(t.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let c=0,l=this.material.length;c<l;c++)o.push(s(t.materials,this.material[c]));r.material=o}else r.material=s(t.materials,this.material);if(this.children.length>0){r.children=[];for(let o=0;o<this.children.length;o++)r.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){r.animations=[];for(let o=0;o<this.animations.length;o++){const c=this.animations[o];r.animations.push(s(t.animations,c))}}if(n){const o=a(t.geometries),c=a(t.materials),l=a(t.textures),u=a(t.images),f=a(t.shapes),h=a(t.skeletons),p=a(t.animations),M=a(t.nodes);o.length>0&&(i.geometries=o),c.length>0&&(i.materials=c),l.length>0&&(i.textures=l),u.length>0&&(i.images=u),f.length>0&&(i.shapes=f),h.length>0&&(i.skeletons=h),p.length>0&&(i.animations=p),M.length>0&&(i.nodes=M)}return i.object=r,i;function a(o){const c=[];for(const l in o){const u=o[l];delete u.metadata,c.push(u)}return c}}clone(t){return new this.constructor().copy(this,t)}copy(t,n=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),n===!0)for(let i=0;i<t.children.length;i++){const r=t.children[i];this.add(r.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};Tt.DEFAULT_UP=new B(0,1,0);Tt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Tt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Ci=class extends Tt{constructor(){super(),this.isGroup=!0,this.type="Group"}},nc={type:"move"},yr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ci,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ci,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new B,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new B),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ci,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new B,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new B,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let i=null,r=null,s=null;const a=this._targetRay,o=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){s=!0;for(const h of e.hand.values()){const p=t.getJointPose(h,n),M=this._getHandJoint(c,h);p!==null&&(M.matrix.fromArray(p.transform.matrix),M.matrix.decompose(M.position,M.rotation,M.scale),M.matrixWorldNeedsUpdate=!0,M.jointRadius=p.radius),M.visible=p!==null}const l=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],f=l.position.distanceTo(u.position);c.inputState.pinching&&f>.025?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&f<=.015&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else o!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,o.eventsEnabled&&o.dispatchEvent({type:"gripUpdated",data:e,target:this})));a!==null&&(i=t.getPose(e.targetRaySpace,n),i===null&&r!==null&&(i=r),i!==null&&(a.matrix.fromArray(i.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,i.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(i.linearVelocity)):a.hasLinearVelocity=!1,i.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(i.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(nc)))}return a!==null&&(a.visible=i!==null),o!==null&&(o.visible=r!==null),c!==null&&(c.visible=s!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new Ci;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},qa={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ln={h:0,s:0,l:0},Pi={h:0,s:0,l:0};function Er(e,t,n){return n<0&&(n+=1),n>1&&(n-=1),n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var De=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const i=e;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=zt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Ge.colorSpaceToWorking(this,t),this}setRGB(e,t,n,i=Ge.workingColorSpace){return this.r=e,this.g=t,this.b=n,Ge.colorSpaceToWorking(this,i),this}setHSL(e,t,n,i=Ge.workingColorSpace){if(e=ts(e,1),t=Be(t,0,1),n=Be(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,s=2*n-r;this.r=Er(s,r,e+1/3),this.g=Er(s,r,e),this.b=Er(s,r,e-1/3)}return Ge.colorSpaceToWorking(this,i),this}setStyle(e,t=zt){function n(r){r!==void 0&&parseFloat(r)<1&&be("Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const s=i[1],a=i[2];switch(s){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:be("Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=i[1],s=r.length;if(s===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(s===6)return this.setHex(parseInt(r,16),t);be("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=zt){const n=qa[e.toLowerCase()];return n!==void 0?this.setHex(n,t):be("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=rn(e.r),this.g=rn(e.g),this.b=rn(e.b),this}copyLinearToSRGB(e){return this.r=$n(e.r),this.g=$n(e.g),this.b=$n(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=zt){return Ge.workingToColorSpace(Mt.copy(this),e),Math.round(Be(Mt.r*255,0,255))*65536+Math.round(Be(Mt.g*255,0,255))*256+Math.round(Be(Mt.b*255,0,255))}getHexString(e=zt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Ge.workingColorSpace){Ge.workingToColorSpace(Mt.copy(this),t);const n=Mt.r,i=Mt.g,r=Mt.b,s=Math.max(n,i,r),a=Math.min(n,i,r);let o,c;const l=(a+s)/2;if(a===s)o=0,c=0;else{const u=s-a;switch(c=l<=.5?u/(s+a):u/(2-s-a),s){case n:o=(i-r)/u+(i<r?6:0);break;case i:o=(r-n)/u+2;break;case r:o=(n-i)/u+4}o/=6}return e.h=o,e.s=c,e.l=l,e}getRGB(e,t=Ge.workingColorSpace){return Ge.workingToColorSpace(Mt.copy(this),t),e.r=Mt.r,e.g=Mt.g,e.b=Mt.b,e}getStyle(e=zt){Ge.workingToColorSpace(Mt.copy(this),e);const t=Mt.r,n=Mt.g,i=Mt.b;return e!=="srgb"?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(e,t,n){return this.getHSL(ln),this.setHSL(ln.h+e,ln.s+t,ln.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(ln),e.getHSL(Pi);const n=gi(ln.h,Pi.h,t),i=gi(ln.s,Pi.s,t),r=gi(ln.l,Pi.l,t);return this.setHSL(n,i,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,i=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*i,this.g=r[1]*t+r[4]*n+r[7]*i,this.b=r[2]*t+r[5]*n+r[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Mt=new De;De.NAMES=qa;var Sd=class Ya{constructor(t,n=25e-5){this.isFogExp2=!0,this.name="",this.color=new De(t),this.density=n}clone(){return new Ya(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}},ic=class extends Tt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new En,this.environmentIntensity=1,this.environmentRotation=new En,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},Ft=new B,Qt=new B,Tr=new B,jt=new B,Un=new B,Nn=new B,Ns=new B,br=new B,Ar=new B,wr=new B,Rr=new rt,Cr=new rt,Pr=new rt,si=class Yn{constructor(t=new B,n=new B,i=new B){this.a=t,this.b=n,this.c=i}static getNormal(t,n,i,r){r.subVectors(i,n),Ft.subVectors(t,n),r.cross(Ft);const s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(t,n,i,r,s){Ft.subVectors(r,n),Qt.subVectors(i,n),Tr.subVectors(t,n);const a=Ft.dot(Ft),o=Ft.dot(Qt),c=Ft.dot(Tr),l=Qt.dot(Qt),u=Qt.dot(Tr),f=a*l-o*o;if(f===0)return s.set(0,0,0),null;const h=1/f,p=(l*c-o*u)*h,M=(a*u-o*c)*h;return s.set(1-p-M,M,p)}static containsPoint(t,n,i,r){return this.getBarycoord(t,n,i,r,jt)===null?!1:jt.x>=0&&jt.y>=0&&jt.x+jt.y<=1}static getInterpolation(t,n,i,r,s,a,o,c){return this.getBarycoord(t,n,i,r,jt)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(s,jt.x),c.addScaledVector(a,jt.y),c.addScaledVector(o,jt.z),c)}static getInterpolatedAttribute(t,n,i,r,s,a){return Rr.setScalar(0),Cr.setScalar(0),Pr.setScalar(0),Rr.fromBufferAttribute(t,n),Cr.fromBufferAttribute(t,i),Pr.fromBufferAttribute(t,r),a.setScalar(0),a.addScaledVector(Rr,s.x),a.addScaledVector(Cr,s.y),a.addScaledVector(Pr,s.z),a}static isFrontFacing(t,n,i,r){return Ft.subVectors(i,n),Qt.subVectors(t,n),Ft.cross(Qt).dot(r)<0}set(t,n,i){return this.a.copy(t),this.b.copy(n),this.c.copy(i),this}setFromPointsAndIndices(t,n,i,r){return this.a.copy(t[n]),this.b.copy(t[i]),this.c.copy(t[r]),this}setFromAttributeAndIndices(t,n,i,r){return this.a.fromBufferAttribute(t,n),this.b.fromBufferAttribute(t,i),this.c.fromBufferAttribute(t,r),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Ft.subVectors(this.c,this.b),Qt.subVectors(this.a,this.b),Ft.cross(Qt).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return Yn.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return Yn.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,i,r,s){return Yn.getInterpolation(t,this.a,this.b,this.c,n,i,r,s)}containsPoint(t){return Yn.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return Yn.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,n){const i=this.a,r=this.b,s=this.c;let a,o;Un.subVectors(r,i),Nn.subVectors(s,i),br.subVectors(t,i);const c=Un.dot(br),l=Nn.dot(br);if(c<=0&&l<=0)return n.copy(i);Ar.subVectors(t,r);const u=Un.dot(Ar),f=Nn.dot(Ar);if(u>=0&&f<=u)return n.copy(r);const h=c*f-u*l;if(h<=0&&c>=0&&u<=0)return a=c/(c-u),n.copy(i).addScaledVector(Un,a);wr.subVectors(t,s);const p=Un.dot(wr),M=Nn.dot(wr);if(M>=0&&p<=M)return n.copy(s);const y=p*l-c*M;if(y<=0&&l>=0&&M<=0)return o=l/(l-M),n.copy(i).addScaledVector(Nn,o);const g=u*M-p*f;if(g<=0&&f-u>=0&&p-M>=0)return Ns.subVectors(s,r),o=(f-u)/(f-u+(p-M)),n.copy(r).addScaledVector(Ns,o);const d=1/(g+y+h);return a=y*d,o=h*d,n.copy(i).addScaledVector(Un,a).addScaledVector(Nn,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},An=class{constructor(e=new B(1/0,1/0,1/0),t=new B(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Bt.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Bt.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=Bt.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let s=0,a=r.count;s<a;s++)e.isMesh===!0?e.getVertexPosition(s,Bt):Bt.fromBufferAttribute(r,s),Bt.applyMatrix4(e.matrixWorld),this.expandByPoint(Bt);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Li.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Li.copy(n.boundingBox)),Li.applyMatrix4(e.matrixWorld),this.union(Li)}const i=e.children;for(let r=0,s=i.length;r<s;r++)this.expandByObject(i[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Bt),Bt.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(ai),Ii.subVectors(this.max,ai),On.subVectors(e.a,ai),Fn.subVectors(e.b,ai),Bn.subVectors(e.c,ai),cn.subVectors(Fn,On),hn.subVectors(Bn,Fn),_n.subVectors(On,Bn);let t=[0,-cn.z,cn.y,0,-hn.z,hn.y,0,-_n.z,_n.y,cn.z,0,-cn.x,hn.z,0,-hn.x,_n.z,0,-_n.x,-cn.y,cn.x,0,-hn.y,hn.x,0,-_n.y,_n.x,0];return!Lr(t,On,Fn,Bn,Ii)||(t=[1,0,0,0,1,0,0,0,1],!Lr(t,On,Fn,Bn,Ii))?!1:(Di.crossVectors(cn,hn),t=[Di.x,Di.y,Di.z],Lr(t,On,Fn,Bn,Ii))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Bt).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Bt).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(en[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),en[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),en[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),en[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),en[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),en[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),en[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),en[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(en),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},en=[new B,new B,new B,new B,new B,new B,new B,new B],Bt=new B,Li=new An,On=new B,Fn=new B,Bn=new B,cn=new B,hn=new B,_n=new B,ai=new B,Ii=new B,Di=new B,vn=new B;function Lr(e,t,n,i,r){for(let s=0,a=e.length-3;s<=a;s+=3){vn.fromArray(e,s);const o=r.x*Math.abs(vn.x)+r.y*Math.abs(vn.y)+r.z*Math.abs(vn.z),c=t.dot(vn),l=n.dot(vn),u=i.dot(vn);if(Math.max(-Math.max(c,l,u),Math.min(c,l,u))>o)return!1}return!0}var ct=new B,Ui=new ze,rc=0,Yt=class extends Tn{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:rc++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=yl,this.updateRanges=[],this.gpuType=xi,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,r=this.itemSize;i<r;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Ui.fromBufferAttribute(this,t),Ui.applyMatrix3(e),this.setXY(t,Ui.x,Ui.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)ct.fromBufferAttribute(this,t),ct.applyMatrix3(e),this.setXYZ(t,ct.x,ct.y,ct.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)ct.fromBufferAttribute(this,t),ct.applyMatrix4(e),this.setXYZ(t,ct.x,ct.y,ct.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)ct.fromBufferAttribute(this,t),ct.applyNormalMatrix(e),this.setXYZ(t,ct.x,ct.y,ct.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)ct.fromBufferAttribute(this,t),ct.transformDirection(e),this.setXYZ(t,ct.x,ct.y,ct.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=qn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=xt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=qn(t,this.array)),t}setX(e,t){return this.normalized&&(t=xt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=qn(t,this.array)),t}setY(e,t){return this.normalized&&(t=xt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=qn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=xt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=qn(t,this.array)),t}setW(e,t){return this.normalized&&(t=xt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=xt(t,this.array),n=xt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.normalized&&(t=xt(t,this.array),n=xt(n,this.array),i=xt(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e*=this.itemSize,this.normalized&&(t=xt(t,this.array),n=xt(n,this.array),i=xt(i,this.array),r=xt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}},Ka=class extends Yt{constructor(e,t,n){super(new Uint16Array(e),t,n)}},Za=class extends Yt{constructor(e,t,n){super(new Uint32Array(e),t,n)}},st=class extends Yt{constructor(e,t,n){super(new Float32Array(e),t,n)}},sc=new An,oi=new B,Ir=new B,wn=class{constructor(e=new B,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):sc.setFromPoints(e).getCenter(n);let i=0;for(let r=0,s=e.length;r<s;r++)i=Math.max(i,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;oi.subVectors(e,this.center);const t=oi.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),i=(n-this.radius)*.5;this.center.addScaledVector(oi,i/n),this.radius+=i}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Ir.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(oi.copy(e.center).add(Ir)),this.expandByPoint(oi.copy(e.center).sub(Ir))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},ac=0,Ut=new Qe,Dr=new Tt,zn=new B,Pt=new An,li=new An,mt=new B,It=class Ja extends Tn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:ac++}),this.uuid=ti(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(El(t)?Za:Ka)(t,1):this.index=t,this}setIndirect(t,n=0){return this.indirect=t,this.indirectOffset=n,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,n){return this.attributes[t]=n,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,n,i=0){this.groups.push({start:t,count:n,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(t,n){this.drawRange.start=t,this.drawRange.count=n}applyMatrix4(t){const n=this.attributes.position;n!==void 0&&(n.applyMatrix4(t),n.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const s=new Ie().getNormalMatrix(t);i.applyNormalMatrix(s),i.needsUpdate=!0}const r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(t),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return Ut.makeRotationFromQuaternion(t),this.applyMatrix4(Ut),this}rotateX(t){return Ut.makeRotationX(t),this.applyMatrix4(Ut),this}rotateY(t){return Ut.makeRotationY(t),this.applyMatrix4(Ut),this}rotateZ(t){return Ut.makeRotationZ(t),this.applyMatrix4(Ut),this}translate(t,n,i){return Ut.makeTranslation(t,n,i),this.applyMatrix4(Ut),this}scale(t,n,i){return Ut.makeScale(t,n,i),this.applyMatrix4(Ut),this}lookAt(t){return Dr.lookAt(t),Dr.updateMatrix(),this.applyMatrix4(Dr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(zn).negate(),this.translate(zn.x,zn.y,zn.z),this}setFromPoints(t){const n=this.getAttribute("position");if(n===void 0){const i=[];for(let r=0,s=t.length;r<s;r++){const a=t[r];i.push(a.x,a.y,a.z||0)}this.setAttribute("position",new st(i,3))}else{const i=Math.min(t.length,n.count);for(let r=0;r<i;r++){const s=t[r];n.setXYZ(r,s.x,s.y,s.z||0)}t.length>n.count&&be("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),n.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new An);const t=this.attributes.position,n=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Ce("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new B(-1/0,-1/0,-1/0),new B(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),n)for(let i=0,r=n.length;i<r;i++){const s=n[i];Pt.setFromBufferAttribute(s),this.morphTargetsRelative?(mt.addVectors(this.boundingBox.min,Pt.min),this.boundingBox.expandByPoint(mt),mt.addVectors(this.boundingBox.max,Pt.max),this.boundingBox.expandByPoint(mt)):(this.boundingBox.expandByPoint(Pt.min),this.boundingBox.expandByPoint(Pt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Ce('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new wn);const t=this.attributes.position,n=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Ce("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new B,1/0);return}if(t){const i=this.boundingSphere.center;if(Pt.setFromBufferAttribute(t),n)for(let s=0,a=n.length;s<a;s++){const o=n[s];li.setFromBufferAttribute(o),this.morphTargetsRelative?(mt.addVectors(Pt.min,li.min),Pt.expandByPoint(mt),mt.addVectors(Pt.max,li.max),Pt.expandByPoint(mt)):(Pt.expandByPoint(li.min),Pt.expandByPoint(li.max))}Pt.getCenter(i);let r=0;for(let s=0,a=t.count;s<a;s++)mt.fromBufferAttribute(t,s),r=Math.max(r,i.distanceToSquared(mt));if(n)for(let s=0,a=n.length;s<a;s++){const o=n[s],c=this.morphTargetsRelative;for(let l=0,u=o.count;l<u;l++)mt.fromBufferAttribute(o,l),c&&(zn.fromBufferAttribute(t,l),mt.add(zn)),r=Math.max(r,i.distanceToSquared(mt))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&Ce('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,n=this.attributes;if(t===null||n.position===void 0||n.normal===void 0||n.uv===void 0){Ce("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=n.position,r=n.normal,s=n.uv;let a=this.getAttribute("tangent");(a===void 0||a.count!==i.count)&&(a=new Yt(new Float32Array(4*i.count),4),this.setAttribute("tangent",a));const o=[],c=[];for(let _=0;_<i.count;_++)o[_]=new B,c[_]=new B;const l=new B,u=new B,f=new B,h=new ze,p=new ze,M=new ze,y=new B,g=new B;function d(_,E,G){l.fromBufferAttribute(i,_),u.fromBufferAttribute(i,E),f.fromBufferAttribute(i,G),h.fromBufferAttribute(s,_),p.fromBufferAttribute(s,E),M.fromBufferAttribute(s,G),u.sub(l),f.sub(l),p.sub(h),M.sub(h);const U=1/(p.x*M.y-M.x*p.y);isFinite(U)&&(y.copy(u).multiplyScalar(M.y).addScaledVector(f,-p.y).multiplyScalar(U),g.copy(f).multiplyScalar(p.x).addScaledVector(u,-M.x).multiplyScalar(U),o[_].add(y),o[E].add(y),o[G].add(y),c[_].add(g),c[E].add(g),c[G].add(g))}let A=this.groups;A.length===0&&(A=[{start:0,count:t.count}]);for(let _=0,E=A.length;_<E;++_){const G=A[_],U=G.start,O=G.count;for(let Y=U,D=U+O;Y<D;Y+=3)d(t.getX(Y+0),t.getX(Y+1),t.getX(Y+2))}const I=new B,x=new B,T=new B,b=new B;function w(_){T.fromBufferAttribute(r,_),b.copy(T);const E=o[_];I.copy(E),I.sub(T.multiplyScalar(T.dot(E))).normalize(),x.crossVectors(b,E);const G=x.dot(c[_])<0?-1:1;a.setXYZW(_,I.x,I.y,I.z,G)}for(let _=0,E=A.length;_<E;++_){const G=A[_],U=G.start,O=G.count;for(let Y=U,D=U+O;Y<D;Y+=3)w(t.getX(Y+0)),w(t.getX(Y+1)),w(t.getX(Y+2))}this._transformed=!0}computeVertexNormals(){const t=this.index,n=this.getAttribute("position");if(n!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==n.count)i=new Yt(new Float32Array(n.count*3),3),this.setAttribute("normal",i);else for(let h=0,p=i.count;h<p;h++)i.setXYZ(h,0,0,0);const r=new B,s=new B,a=new B,o=new B,c=new B,l=new B,u=new B,f=new B;if(t)for(let h=0,p=t.count;h<p;h+=3){const M=t.getX(h+0),y=t.getX(h+1),g=t.getX(h+2);r.fromBufferAttribute(n,M),s.fromBufferAttribute(n,y),a.fromBufferAttribute(n,g),u.subVectors(a,s),f.subVectors(r,s),u.cross(f),o.fromBufferAttribute(i,M),c.fromBufferAttribute(i,y),l.fromBufferAttribute(i,g),o.add(u),c.add(u),l.add(u),i.setXYZ(M,o.x,o.y,o.z),i.setXYZ(y,c.x,c.y,c.z),i.setXYZ(g,l.x,l.y,l.z)}else for(let h=0,p=n.count;h<p;h+=3)r.fromBufferAttribute(n,h+0),s.fromBufferAttribute(n,h+1),a.fromBufferAttribute(n,h+2),u.subVectors(a,s),f.subVectors(r,s),u.cross(f),i.setXYZ(h+0,u.x,u.y,u.z),i.setXYZ(h+1,u.x,u.y,u.z),i.setXYZ(h+2,u.x,u.y,u.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let n=0,i=t.count;n<i;n++)mt.fromBufferAttribute(t,n),mt.normalize(),t.setXYZ(n,mt.x,mt.y,mt.z)}toNonIndexed(){function t(o,c){const l=o.array,u=o.itemSize,f=o.normalized,h=new l.constructor(c.length*u);let p=0,M=0;for(let y=0,g=c.length;y<g;y++){o.isInterleavedBufferAttribute?p=c[y]*o.data.stride+o.offset:p=c[y]*u;for(let d=0;d<u;d++)h[M++]=l[p++]}return new Yt(h,u,f)}if(this.index===null)return be("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const n=new Ja,i=this.index.array,r=this.attributes;for(const o in r){const c=r[o],l=t(c,i);n.setAttribute(o,l)}const s=this.morphAttributes;for(const o in s){const c=[],l=s[o];for(let u=0,f=l.length;u<f;u++){const h=l[u],p=t(h,i);c.push(p)}n.morphAttributes[o]=c}n.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,c=a.length;o<c;o++){const l=a[o];n.addGroup(l.start,l.count,l.materialIndex)}return n}toJSON(){const t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){const c=this.parameters;for(const l in c)c[l]!==void 0&&(t[l]=c[l]);return t}t.data={attributes:{}};const n=this.index;n!==null&&(t.data.index={type:n.array.constructor.name,array:Array.prototype.slice.call(n.array)});const i=this.attributes;for(const c in i){const l=i[c];t.data.attributes[c]=l.toJSON(t.data)}const r={};let s=!1;for(const c in this.morphAttributes){const l=this.morphAttributes[c],u=[];for(let f=0,h=l.length;f<h;f++){const p=l[f];u.push(p.toJSON(t.data))}u.length>0&&(r[c]=u,s=!0)}s&&(t.data.morphAttributes=r,t.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(t.data.boundingSphere=o.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const n={};this.name=t.name;const i=t.index;i!==null&&this.setIndex(i.clone());const r=t.attributes;for(const l in r){const u=r[l];this.setAttribute(l,u.clone(n))}const s=t.morphAttributes;for(const l in s){const u=[],f=s[l];for(let h=0,p=f.length;h<p;h++)u.push(f[h].clone(n));this.morphAttributes[l]=u}this.morphTargetsRelative=t.morphTargetsRelative;const a=t.groups;for(let l=0,u=a.length;l<u;l++){const f=a[l];this.addGroup(f.start,f.count,f.materialIndex)}const o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());const c=t.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},Ur=new B,oc=new B,lc=new Ie,dn=class{constructor(e=new B(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const i=Ur.subVectors(n,t).cross(oc.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){const i=e.delta(Ur),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(s<0||s>1)?null:t.copy(e.start).addScaledVector(i,s)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||lc.getNormalMatrix(e),i=this.coplanarPoint(Ur).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},cc=0,mn=class extends Tn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:cc++}),this.uuid=ti(),this.name="",this.type="Material",this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new De(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=gr,this.stencilZFail=gr,this.stencilZPass=gr,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){be(`Material: parameter '${t}' has value of undefined.`);continue}const i=this[t];if(i===void 0){be(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector2&&n&&n.isVector2||i&&i.isEuler&&n&&n.isEuler||i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(r){const s=[];for(const a in r){const o=r[a];delete o.metadata,s.push(o)}return s}if(t){const r=i(e.textures),s=i(e.images);r.length>0&&(n.textures=r),s.length>0&&(n.images=s)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new De().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new dn().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new ze().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new ze().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const i=t.length;n=new Array(i);for(let r=0;r!==i;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},tn=new B,Nr=new B,Ni=new B,Oi=new B,is=class{constructor(e=new B,t=new B(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,tn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=tn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(tn.copy(this.origin).addScaledVector(this.direction,t),tn.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){Nr.copy(e).add(t).multiplyScalar(.5),Ni.copy(t).sub(e).normalize(),Oi.copy(this.origin).sub(Nr);const r=e.distanceTo(t)*.5,s=-this.direction.dot(Ni),a=Oi.dot(this.direction),o=-Oi.dot(Ni),c=Oi.lengthSq(),l=Math.abs(1-s*s);let u,f,h,p;if(l>0)if(u=s*o-a,f=s*a-o,p=r*l,u>=0)if(f>=-p)if(f<=p){const M=1/l;u*=M,f*=M,h=u*(u+s*f+2*a)+f*(s*u+f+2*o)+c}else f=r,u=Math.max(0,-(s*f+a)),h=-u*u+f*(f+2*o)+c;else f=-r,u=Math.max(0,-(s*f+a)),h=-u*u+f*(f+2*o)+c;else f<=-p?(u=Math.max(0,-(-s*r+a)),f=u>0?-r:Math.min(Math.max(-r,-o),r),h=-u*u+f*(f+2*o)+c):f<=p?(u=0,f=Math.min(Math.max(-r,-o),r),h=f*(f+2*o)+c):(u=Math.max(0,-(s*r+a)),f=u>0?r:Math.min(Math.max(-r,-o),r),h=-u*u+f*(f+2*o)+c);else f=s>0?-r:r,u=Math.max(0,-(s*f+a)),h=-u*u+f*(f+2*o)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),i&&i.copy(Nr).addScaledVector(Ni,f),h}intersectSphere(e,t){if(e.radius<0)return null;tn.subVectors(e.center,this.origin);const n=tn.dot(this.direction),i=tn.dot(tn)-n*n,r=e.radius*e.radius;if(i>r)return null;const s=Math.sqrt(r-i),a=n-s,o=n+s;return o<0?null:a<0?this.at(o,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,r,s,a,o;const c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,f=this.origin;return c>=0?(n=(e.min.x-f.x)*c,i=(e.max.x-f.x)*c):(n=(e.max.x-f.x)*c,i=(e.min.x-f.x)*c),l>=0?(r=(e.min.y-f.y)*l,s=(e.max.y-f.y)*l):(r=(e.max.y-f.y)*l,s=(e.min.y-f.y)*l),n>s||r>i||((r>n||isNaN(n))&&(n=r),(s<i||isNaN(i))&&(i=s),u>=0?(a=(e.min.z-f.z)*u,o=(e.max.z-f.z)*u):(a=(e.max.z-f.z)*u,o=(e.min.z-f.z)*u),n>o||a>i)||((a>n||n!==n)&&(n=a),(o<i||i!==i)&&(i=o),i<0)?null:this.at(n>=0?n:i,t)}intersectsBox(e){return this.intersectBox(e,tn)!==null}intersectTriangle(e,t,n,i,r){const s=this.origin,a=this.direction,o=a.x,c=a.y,l=a.z,u=e.x-s.x,f=e.y-s.y,h=e.z-s.z,p=t.x-s.x,M=t.y-s.y,y=t.z-s.z,g=n.x-s.x,d=n.y-s.y,A=n.z-s.z,I=Math.abs(o),x=Math.abs(c),T=Math.abs(l);let b,w,_,E,G,U,O,Y,D,V,J,H;if(I>=x&&I>=T?(_=o,U=u,D=p,H=g,o>=0?(b=c,w=l,E=f,G=h,O=M,Y=y,V=d,J=A):(b=l,w=c,E=h,G=f,O=y,Y=M,V=A,J=d)):x>=T?(_=c,U=f,D=M,H=d,c>=0?(b=l,w=o,E=h,G=u,O=y,Y=p,V=A,J=g):(b=o,w=l,E=u,G=h,O=p,Y=y,V=g,J=A)):(_=l,U=h,D=y,H=A,l>=0?(b=o,w=c,E=u,G=f,O=p,Y=M,V=g,J=d):(b=c,w=o,E=f,G=u,O=M,Y=p,V=d,J=g)),_===0)return null;const oe=b/_,X=w/_,K=1/_,$=E-oe*U,Ne=G-X*U,ye=O-oe*D,je=Y-X*D,Ue=V-oe*H,q=J-X*H,ne=Ue*je-q*ye,ae=$*q-Ne*Ue,Te=ye*Ne-je*$;if(i){if(ne<0||ae<0||Te<0)return null}else if((ne<0||ae<0||Te<0)&&(ne>0||ae>0||Te>0))return null;const Re=ne+ae+Te;if(Re===0)return null;const de=K*(ne*U+ae*D+Te*H);return(Re>0?de<0:de>0)?null:this.at(de/Re,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},$a=class extends mn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new De(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new En,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Os=new Qe,Mn=new is,Fi=new wn,Fs=new B,Bi=new B,zi=new B,Vi=new B,Or=new B,Gi=new B,Bs=new B,Hi=new B,gt=class extends Tt{constructor(e=new It,t=new $a){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){const n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let i=0,r=n.length;i<r;i++){const s=n[i].name||String(i);this.morphTargetInfluences.push(0),this.morphTargetDictionary[s]=i}}}}getVertexPosition(e,t){const n=this.geometry,i=n.attributes.position,r=n.morphAttributes.position,s=n.morphTargetsRelative;t.fromBufferAttribute(i,e);const a=this.morphTargetInfluences;if(r&&a){Gi.set(0,0,0);for(let o=0,c=r.length;o<c;o++){const l=a[o],u=r[o];l!==0&&(Or.fromBufferAttribute(u,e),s?Gi.addScaledVector(Or,l):Gi.addScaledVector(Or.sub(t),l))}t.add(Gi)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){const n=this.geometry,i=this.material,r=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Fi.copy(n.boundingSphere),Fi.applyMatrix4(r),Mn.copy(e.ray).recast(e.near),!(Fi.containsPoint(Mn.origin)===!1&&(Mn.intersectSphere(Fi,Fs)===null||Mn.origin.distanceToSquared(Fs)>(e.far-e.near)**2))&&(Os.copy(r).invert(),Mn.copy(e.ray).applyMatrix4(Os),!(n.boundingBox!==null&&Mn.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Mn)))}_computeIntersections(e,t,n){let i;const r=this.geometry,s=this.material,a=r.index,o=r.attributes.position,c=r.attributes.uv,l=r.attributes.uv1,u=r.attributes.normal,f=r.groups,h=r.drawRange;if(a!==null)if(Array.isArray(s))for(let p=0,M=f.length;p<M;p++){const y=f[p],g=s[y.materialIndex],d=Math.max(y.start,h.start),A=Math.min(a.count,Math.min(y.start+y.count,h.start+h.count));for(let I=d,x=A;I<x;I+=3){const T=a.getX(I),b=a.getX(I+1),w=a.getX(I+2);i=ki(this,g,e,n,c,l,u,T,b,w),i&&(i.faceIndex=Math.floor(I/3),i.face.materialIndex=y.materialIndex,t.push(i))}}else{const p=Math.max(0,h.start),M=Math.min(a.count,h.start+h.count);for(let y=p,g=M;y<g;y+=3){const d=a.getX(y),A=a.getX(y+1),I=a.getX(y+2);i=ki(this,s,e,n,c,l,u,d,A,I),i&&(i.faceIndex=Math.floor(y/3),t.push(i))}}else if(o!==void 0)if(Array.isArray(s))for(let p=0,M=f.length;p<M;p++){const y=f[p],g=s[y.materialIndex],d=Math.max(y.start,h.start),A=Math.min(o.count,Math.min(y.start+y.count,h.start+h.count));for(let I=d,x=A;I<x;I+=3){const T=I,b=I+1,w=I+2;i=ki(this,g,e,n,c,l,u,T,b,w),i&&(i.faceIndex=Math.floor(I/3),i.face.materialIndex=y.materialIndex,t.push(i))}}else{const p=Math.max(0,h.start),M=Math.min(o.count,h.start+h.count);for(let y=p,g=M;y<g;y+=3){const d=y,A=y+1,I=y+2;i=ki(this,s,e,n,c,l,u,d,A,I),i&&(i.faceIndex=Math.floor(y/3),t.push(i))}}}};function hc(e,t,n,i,r,s,a,o){let c;if(t.side===1?c=i.intersectTriangle(a,s,r,!0,o):c=i.intersectTriangle(r,s,a,t.side===0,o),c===null)return null;Hi.copy(o),Hi.applyMatrix4(e.matrixWorld);const l=n.ray.origin.distanceTo(Hi);return l<n.near||l>n.far?null:{distance:l,point:Hi.clone(),object:e}}function ki(e,t,n,i,r,s,a,o,c,l){e.getVertexPosition(o,Bi),e.getVertexPosition(c,zi),e.getVertexPosition(l,Vi);const u=hc(e,t,n,i,Bi,zi,Vi,Bs);if(u){const f=new B;si.getBarycoord(Bs,Bi,zi,Vi,f),r&&(u.uv=si.getInterpolatedAttribute(r,o,c,l,f,new ze)),s&&(u.uv1=si.getInterpolatedAttribute(s,o,c,l,f,new ze)),a&&(u.normal=si.getInterpolatedAttribute(a,o,c,l,f,new B),u.normal.dot(i.direction)>0&&u.normal.multiplyScalar(-1));const h={a:o,b:c,c:l,normal:new B,materialIndex:0};si.getNormal(Bi,zi,Vi,h.normal),u.face=h,u.barycoord=f}return u}var Qa=class extends Gt{constructor(e=null,t=1,n=1,i,r,s,a,o,c=Et,l=Et,u,f){super(null,s,a,o,c,l,i,r,u,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},zs=class extends Yt{constructor(e,t,n,i=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Vn=new Qe,Vs=new Qe,Wi=[],Gs=new An,uc=new Qe,ci=new gt,hi=new wn,dc=class extends gt{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new zs(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,uc)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new An),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Vn),Gs.copy(e.boundingBox).applyMatrix4(Vn),this.boundingBox.union(Gs)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new wn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Vn),hi.copy(e.boundingSphere).applyMatrix4(Vn),this.boundingSphere.union(hi)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const n=t.morphTargetInfluences,i=this.morphTexture.source.data.data,r=e*(n.length+1)+1;for(let s=0;s<n.length;s++)n[s]=i[r+s]}raycast(e,t){const n=this.matrixWorld,i=this.count;if(ci.geometry=this.geometry,ci.material=this.material,ci.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),hi.copy(this.boundingSphere),hi.applyMatrix4(n),e.ray.intersectsSphere(hi)!==!1))for(let r=0;r<i;r++){this.getMatrixAt(r,Vn),Vs.multiplyMatrices(n,Vn),ci.matrixWorld=Vs,ci.raycast(e,Wi);for(let s=0,a=Wi.length;s<a;s++){const o=Wi[s];o.instanceId=r,o.object=this,t.push(o)}Wi.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new zs(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){const n=t.morphTargetInfluences,i=n.length+1;this.morphTexture===null&&(this.morphTexture=new Qa(new Float32Array(i*this.count),i,this.count,Fa,xi));const r=this.morphTexture.source.data.data;let s=0;for(let c=0;c<n.length;c++)s+=n[c];const a=this.geometry.morphTargetsRelative?1:1-s,o=i*e;return r[o]=a,r.set(n,o+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Sn=new wn,fc=new ze(.5,.5),Xi=new B,rs=class{constructor(e=new dn,t=new dn,n=new dn,i=new dn,r=new dn,s=new dn){this.planes=[e,t,n,i,r,s]}set(e,t,n,i,r,s){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(i),a[4].copy(r),a[5].copy(s),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Qn,n=!1){const i=this.planes,r=e.elements,s=r[0],a=r[1],o=r[2],c=r[3],l=r[4],u=r[5],f=r[6],h=r[7],p=r[8],M=r[9],y=r[10],g=r[11],d=r[12],A=r[13],I=r[14],x=r[15];if(i[0].setComponents(c-s,h-l,g-p,x-d).normalize(),i[1].setComponents(c+s,h+l,g+p,x+d).normalize(),i[2].setComponents(c+a,h+u,g+M,x+A).normalize(),i[3].setComponents(c-a,h-u,g-M,x-A).normalize(),n)i[4].setComponents(o,f,y,I).normalize(),i[5].setComponents(c-o,h-f,g-y,x-I).normalize();else if(i[4].setComponents(c-o,h-f,g-y,x-I).normalize(),t===2e3)i[5].setComponents(c+o,h+f,g+y,x+I).normalize();else if(t===2001)i[5].setComponents(o,f,y,I).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Sn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Sn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Sn)}intersectsSprite(e){Sn.center.set(0,0,0);const t=fc.distanceTo(e.center);return Sn.radius=.7071067811865476+t,Sn.applyMatrix4(e.matrixWorld),this.intersectsSphere(Sn)}intersectsSphere(e){const t=this.planes,n=e.center,i=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const i=t[n];if(Xi.x=i.normal.x>0?e.max.x:e.min.x,Xi.y=i.normal.y>0?e.max.y:e.min.y,Xi.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(Xi)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},ja=class extends mn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new De(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},lr=new B,cr=new B,Hs=new Qe,ui=new is,qi=new wn,Fr=new B,ks=new B,pc=class extends Tt{constructor(e=new It,t=new ja){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let i=1,r=t.count;i<r;i++)lr.fromBufferAttribute(t,i-1),cr.fromBufferAttribute(t,i),n[i]=n[i-1],n[i]+=lr.distanceTo(cr);e.setAttribute("lineDistance",new st(n,1))}else be("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){const n=this.geometry,i=this.matrixWorld,r=e.params.Line.threshold,s=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),qi.copy(n.boundingSphere),qi.applyMatrix4(i),qi.radius+=r,e.ray.intersectsSphere(qi)===!1)return;Hs.copy(i).invert(),ui.copy(e.ray).applyMatrix4(Hs);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),o=a*a,c=this.isLineSegments?2:1,l=n.index,u=n.attributes.position;if(l!==null){const f=Math.max(0,s.start),h=Math.min(l.count,s.start+s.count);for(let p=f,M=h-1;p<M;p+=c){const y=l.getX(p),g=l.getX(p+1),d=Yi(this,e,ui,o,y,g,p);d&&t.push(d)}if(this.isLineLoop){const p=l.getX(h-1),M=l.getX(f),y=Yi(this,e,ui,o,p,M,h-1);y&&t.push(y)}}else{const f=Math.max(0,s.start),h=Math.min(u.count,s.start+s.count);for(let p=f,M=h-1;p<M;p+=c){const y=Yi(this,e,ui,o,p,p+1,p);y&&t.push(y)}if(this.isLineLoop){const p=Yi(this,e,ui,o,h-1,f,h-1);p&&t.push(p)}}}updateMorphTargets(){const e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){const n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let i=0,r=n.length;i<r;i++){const s=n[i].name||String(i);this.morphTargetInfluences.push(0),this.morphTargetDictionary[s]=i}}}}};function Yi(e,t,n,i,r,s,a){const o=e.geometry.attributes.position;if(lr.fromBufferAttribute(o,r),cr.fromBufferAttribute(o,s),n.distanceSqToSegment(lr,cr,Fr,ks)>i)return;Fr.applyMatrix4(e.matrixWorld);const c=t.ray.origin.distanceTo(Fr);if(!(c<t.near||c>t.far))return{distance:c,point:ks.clone().applyMatrix4(e.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:e}}var Ws=new B,Xs=new B,mc=class extends pc{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let i=0,r=t.count;i<r;i+=2)Ws.fromBufferAttribute(t,i),Xs.fromBufferAttribute(t,i+1),n[i]=i===0?0:n[i-1],n[i+1]=n[i]+Ws.distanceTo(Xs);e.setAttribute("lineDistance",new st(n,1))}else be("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}},gc=class extends mn{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new De(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},qs=new Qe,Jr=new is,Ki=new wn,Zi=new B,xd=class extends Tt{constructor(e=new It,t=new gc){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){const n=this.geometry,i=this.matrixWorld,r=e.params.Points.threshold,s=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Ki.copy(n.boundingSphere),Ki.applyMatrix4(i),Ki.radius+=r,e.ray.intersectsSphere(Ki)===!1)return;qs.copy(i).invert(),Jr.copy(e.ray).applyMatrix4(qs);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),o=a*a,c=n.index,l=n.attributes.position;if(c!==null){const u=Math.max(0,s.start),f=Math.min(c.count,s.start+s.count);for(let h=u,p=f;h<p;h++){const M=c.getX(h);Zi.fromBufferAttribute(l,M),Ys(Zi,M,o,i,e,t,this)}}else{const u=Math.max(0,s.start),f=Math.min(l.count,s.start+s.count);for(let h=u,p=f;h<p;h++)Zi.fromBufferAttribute(l,h),Ys(Zi,h,o,i,e,t,this)}}updateMorphTargets(){const e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){const n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let i=0,r=n.length;i<r;i++){const s=n[i].name||String(i);this.morphTargetInfluences.push(0),this.morphTargetDictionary[s]=i}}}}};function Ys(e,t,n,i,r,s,a){const o=Jr.distanceSqToPoint(e);if(o<n){const c=new B;Jr.closestPointToPoint(e,c),c.applyMatrix4(i);const l=r.ray.origin.distanceTo(c);if(l<r.near||l>r.far)return;s.push({distance:l,distanceToRay:Math.sqrt(o),point:c,index:t,face:null,faceIndex:null,barycoord:null,object:a})}}var eo=class extends Gt{constructor(e=[],t=301,n,i,r,s,a,o,c,l){super(e,t,n,i,r,s,a,o,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Si=class extends Gt{constructor(e,t,n=yn,i,r,s,a=Et,o=Et,c,l=vi,u=1){if(l!==1026&&l!==1027)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");super({width:e,height:t,depth:u},i,r,s,a,o,l,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new ns(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},_c=class extends Si{constructor(e,t=yn,n=301,i,r,s=Et,a=Et,o,c=vi){const l={width:e,height:e,depth:1},u=[l,l,l,l,l,l];super(e,e,t,n,i,r,s,a,o,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},to=class extends Gt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},hr=class no extends It{constructor(t=1,n=1,i=1,r=1,s=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:n,depth:i,widthSegments:r,heightSegments:s,depthSegments:a};const o=this;r=Math.floor(r),s=Math.floor(s),a=Math.floor(a);const c=[],l=[],u=[],f=[];let h=0,p=0;M("z","y","x",-1,-1,i,n,t,a,s,0),M("z","y","x",1,-1,i,n,-t,a,s,1),M("x","z","y",1,1,t,i,n,r,a,2),M("x","z","y",1,-1,t,i,-n,r,a,3),M("x","y","z",1,-1,t,n,i,r,s,4),M("x","y","z",-1,-1,t,n,-i,r,s,5),this.setIndex(c),this.setAttribute("position",new st(l,3)),this.setAttribute("normal",new st(u,3)),this.setAttribute("uv",new st(f,2));function M(y,g,d,A,I,x,T,b,w,_,E){const G=x/w,U=T/_,O=x/2,Y=T/2,D=b/2,V=w+1,J=_+1;let H=0,oe=0;const X=new B;for(let K=0;K<J;K++){const $=K*U-Y;for(let Ne=0;Ne<V;Ne++)X[y]=(Ne*G-O)*A,X[g]=$*I,X[d]=D,l.push(X.x,X.y,X.z),X[y]=0,X[g]=0,X[d]=b>0?1:-1,u.push(X.x,X.y,X.z),f.push(Ne/w),f.push(1-K/_),H+=1}for(let K=0;K<_;K++)for(let $=0;$<w;$++){const Ne=h+$+V*K,ye=h+$+V*(K+1),je=h+($+1)+V*(K+1),Ue=h+($+1)+V*K;c.push(Ne,ye,Ue),c.push(ye,je,Ue),oe+=6}o.addGroup(p,oe,E),p+=oe,h+=H}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new no(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},vc=class io extends It{constructor(t=1,n=1,i=1,r=32,s=1,a=!1,o=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:n,height:i,radialSegments:r,heightSegments:s,openEnded:a,thetaStart:o,thetaLength:c};const l=this;r=Math.floor(r),s=Math.floor(s);const u=[],f=[],h=[],p=[];let M=0;const y=[],g=i/2;let d=0;A(),a===!1&&(t>0&&I(!0),n>0&&I(!1)),this.setIndex(u),this.setAttribute("position",new st(f,3)),this.setAttribute("normal",new st(h,3)),this.setAttribute("uv",new st(p,2));function A(){const x=new B,T=new B;let b=0;const w=(n-t)/i;for(let _=0;_<=s;_++){const E=[],G=_/s,U=G*(n-t)+t;for(let O=0;O<=r;O++){const Y=O/r,D=Y*c+o,V=Math.sin(D),J=Math.cos(D);T.x=U*V,T.y=-G*i+g,T.z=U*J,f.push(T.x,T.y,T.z),x.set(V,w,J).normalize(),h.push(x.x,x.y,x.z),p.push(Y,1-G),E.push(M++)}y.push(E)}for(let _=0;_<r;_++)for(let E=0;E<s;E++){const G=y[E][_],U=y[E+1][_],O=y[E+1][_+1],Y=y[E][_+1];(t>0||E!==0)&&(u.push(G,U,Y),b+=3),(n>0||E!==s-1)&&(u.push(U,O,Y),b+=3)}l.addGroup(d,b,0),d+=b}function I(x){const T=M,b=new ze,w=new B;let _=0;const E=x===!0?t:n,G=x===!0?1:-1;for(let O=1;O<=r;O++)f.push(0,g*G,0),h.push(0,G,0),p.push(.5,.5),M++;const U=M;for(let O=0;O<=r;O++){const Y=O/r*c+o,D=Math.cos(Y),V=Math.sin(Y);w.x=E*V,w.y=g*G,w.z=E*D,f.push(w.x,w.y,w.z),h.push(0,G,0),b.x=D*.5+.5,b.y=V*.5*G+.5,p.push(b.x,b.y),M++}for(let O=0;O<r;O++){const Y=T+O,D=U+O;x===!0?u.push(D,D+1,Y):u.push(D+1,D,Y),_+=3}l.addGroup(d,_,x===!0?1:2),d+=_}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new io(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},yd=class ro extends vc{constructor(t=1,n=1,i=32,r=1,s=!1,a=0,o=Math.PI*2){super(0,t,n,i,r,s,a,o),this.type="ConeGeometry",this.parameters={radius:t,height:n,radialSegments:i,heightSegments:r,openEnded:s,thetaStart:a,thetaLength:o}}static fromJSON(t){return new ro(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},so=class ao extends It{constructor(t=1,n=1,i=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:n,widthSegments:i,heightSegments:r};const s=t/2,a=n/2,o=Math.floor(i),c=Math.floor(r),l=o+1,u=c+1,f=t/o,h=n/c,p=[],M=[],y=[],g=[];for(let d=0;d<u;d++){const A=d*h-a;for(let I=0;I<l;I++){const x=I*f-s;M.push(x,-A,0),y.push(0,0,1),g.push(I/o),g.push(1-d/c)}}for(let d=0;d<c;d++)for(let A=0;A<o;A++){const I=A+l*d,x=A+l*(d+1),T=A+1+l*(d+1),b=A+1+l*d;p.push(I,x,b),p.push(x,T,b)}this.setIndex(p),this.setAttribute("position",new st(M,3)),this.setAttribute("normal",new st(y,3)),this.setAttribute("uv",new st(g,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new ao(t.width,t.height,t.widthSegments,t.heightSegments)}},Ed=class oo extends It{constructor(t=.5,n=1,i=32,r=1,s=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:n,thetaSegments:i,phiSegments:r,thetaStart:s,thetaLength:a},i=Math.max(3,i),r=Math.max(1,r);const o=[],c=[],l=[],u=[];let f=t;const h=(n-t)/r,p=new B,M=new ze;for(let y=0;y<=r;y++){for(let g=0;g<=i;g++){const d=s+g/i*a;p.x=f*Math.cos(d),p.y=f*Math.sin(d),c.push(p.x,p.y,p.z),l.push(0,0,1),M.x=(p.x/n+1)/2,M.y=(p.y/n+1)/2,u.push(M.x,M.y)}f+=h}for(let y=0;y<r;y++){const g=y*(i+1);for(let d=0;d<i;d++){const A=d+g,I=A,x=A+i+1,T=A+i+2,b=A+1;o.push(I,x,b),o.push(x,T,b)}}this.setIndex(o),this.setAttribute("position",new st(c,3)),this.setAttribute("normal",new st(l,3)),this.setAttribute("uv",new st(u,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new oo(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}},Td=class lo extends It{constructor(t=1,n=32,i=16,r=0,s=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:n,heightSegments:i,phiStart:r,phiLength:s,thetaStart:a,thetaLength:o},n=Math.max(3,Math.floor(n)),i=Math.max(2,Math.floor(i));const c=Math.min(a+o,Math.PI);let l=0;const u=[],f=new B,h=new B,p=[],M=[],y=[],g=[];for(let d=0;d<=i;d++){const A=[],I=d/i,x=a+I*o,T=t*Math.cos(x),b=Math.sqrt(t*t-T*T);let w=0;d===0&&a===0?w=.5/n:d===i&&c===Math.PI&&(w=-.5/n);for(let _=0;_<=n;_++){const E=_/n,G=r+E*s;f.x=-b*Math.cos(G),f.y=T,f.z=b*Math.sin(G),M.push(f.x,f.y,f.z),h.copy(f).normalize(),y.push(h.x,h.y,h.z),g.push(E+w,1-I),A.push(l++)}u.push(A)}for(let d=0;d<i;d++)for(let A=0;A<n;A++){const I=u[d][A+1],x=u[d][A],T=u[d+1][A],b=u[d+1][A+1];(d!==0||a>0)&&p.push(I,x,b),(d!==i-1||c<Math.PI)&&p.push(x,T,b)}this.setIndex(p),this.setAttribute("position",new st(M,3)),this.setAttribute("normal",new st(y,3)),this.setAttribute("uv",new st(g,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new lo(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};function ei(e){const t={};for(const n in e){t[n]={};for(const i in e[n]){const r=e[n][i];if(Ks(r))r.isRenderTargetTexture?(be("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[n][i]=null):t[n][i]=r.clone();else if(Array.isArray(r))if(Ks(r[0])){const s=[];for(let a=0,o=r.length;a<o;a++)s[a]=r[a].clone();t[n][i]=s}else t[n][i]=r.slice();else t[n][i]=r}}return t}function yt(e){const t={};for(let n=0;n<e.length;n++){const i=ei(e[n]);for(const r in i)t[r]=i[r]}return t}function Ks(e){return e&&(e.isColor||e.isMatrix3||e.isMatrix4||e.isVector2||e.isVector3||e.isVector4||e.isTexture||e.isQuaternion)}function Mc(e){const t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function co(e){const t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:Ge.workingColorSpace}var Sc={clone:ei,merge:yt},xc=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,yc=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Kt=class extends mn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=xc,this.fragmentShader=yc,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ei(e.uniforms),this.uniformsGroups=Mc(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const i in this.uniforms){const r=this.uniforms[i].value;r&&r.isTexture?t.uniforms[i]={type:"t",value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[i]={type:"c",value:r.getHex()}:r&&r.isVector2?t.uniforms[i]={type:"v2",value:r.toArray()}:r&&r.isVector3?t.uniforms[i]={type:"v3",value:r.toArray()}:r&&r.isVector4?t.uniforms[i]={type:"v4",value:r.toArray()}:r&&r.isMatrix3?t.uniforms[i]={type:"m3",value:r.toArray()}:r&&r.isMatrix4?t.uniforms[i]={type:"m4",value:r.toArray()}:t.uniforms[i]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(const n in e.uniforms){const i=e.uniforms[n];switch(this.uniforms[n]={},i.type){case"t":this.uniforms[n].value=t[i.value]||null;break;case"c":this.uniforms[n].value=new De().setHex(i.value);break;case"v2":this.uniforms[n].value=new ze().fromArray(i.value);break;case"v3":this.uniforms[n].value=new B().fromArray(i.value);break;case"v4":this.uniforms[n].value=new rt().fromArray(i.value);break;case"m3":this.uniforms[n].value=new Ie().fromArray(i.value);break;case"m4":this.uniforms[n].value=new Qe().fromArray(i.value);break;default:this.uniforms[n].value=i.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(const n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},Ec=class extends Kt{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},$r=class extends mn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new De(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new De(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new ze(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new En,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},bd=class extends $r{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new ze(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Be(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new De(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new De(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new De(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(e){this._retroreflectivity>0!=e>0&&this.version++,this._retroreflectivity=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.retroreflectivity=e.retroreflectivity,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}},Tc=class extends mn{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new De(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new De(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new ze(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new En,this.combine=0,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},bc=class extends mn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=xl,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Ac=class extends mn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Gn(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT=="number"?new t(e):Array.prototype.slice.call(e)}function Br(e){return e!==void 0&&e.inTangents!==void 0&&e.outTangents!==void 0}var yi=class{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let n=this._cachedIndex,i=t[n],r=t[n-1];n:{e:{let s;t:{i:if(!(e<i)){for(let a=n+2;;){if(i===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=i,i=t[++n],e<i)break e}s=t.length;break t}if(!(e>=r)){const a=t[1];e<a&&(n=2,r=a);for(let o=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===o)break;if(i=r,r=t[--n-1],e>=r)break e}s=n,n=0;break t}break n}for(;n<s;){const a=n+s>>>1;e<t[a]?s=a:n=a+1}if(i=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,i)}return this.interpolate_(n,r,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i;for(let s=0;s!==i;++s)t[s]=n[r+s];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},wc=class extends yi{constructor(e,t,n,i){super(e,t,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Ms,endingEnd:Ms}}intervalChanged_(e,t,n){const i=this.parameterPositions;let r=e-2,s=e+1,a=i[r],o=i[s];if(a===void 0)switch(this.getSettings_().endingStart){case Ss:r=e,a=2*t-n;break;case xs:r=i.length-2,a=t+i[r]-i[r+1];break;default:r=e,a=n}if(o===void 0)switch(this.getSettings_().endingEnd){case Ss:s=e,o=2*n-t;break;case xs:s=1,o=n+i[1]-i[0];break;default:s=e-1,o=t}const c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(o-n),this._offsetPrev=r*l,this._offsetNext=s*l}interpolate_(e,t,n,i){const r=this.resultBuffer,s=this.sampleValues,a=this.valueSize,o=e*a,c=o-a,l=this._offsetPrev,u=this._offsetNext,f=this._weightPrev,h=this._weightNext,p=(n-t)/(i-t),M=p*p,y=M*p,g=-f*y+2*f*M-f*p,d=(1+f)*y+(-1.5-2*f)*M+(-.5+f)*p+1,A=(-1-h)*y+(1.5+h)*M+.5*p,I=h*y-h*M;for(let x=0;x!==a;++x)r[x]=g*s[l+x]+d*s[c+x]+A*s[o+x]+I*s[u+x];return r}},Rc=class extends yi{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const r=this.resultBuffer,s=this.sampleValues,a=this.valueSize,o=e*a,c=o-a,l=(n-t)/(i-t),u=1-l;for(let f=0;f!==a;++f)r[f]=s[c+f]*u+s[o+f]*l;return r}},Cc=class extends yi{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}},Pc=class extends yi{interpolate_(e,t,n,i){const r=this.resultBuffer,s=this.sampleValues,a=this.valueSize,o=e*a,c=o-a,l=this.inTangents,u=this.outTangents;if(!l||!u){const p=(n-t)/(i-t),M=1-p;for(let y=0;y!==a;++y)r[y]=s[c+y]*M+s[o+y]*p;return r}const f=a*2,h=e-1;for(let p=0;p!==a;++p){const M=s[c+p],y=s[o+p],g=h*f+p*2,d=u[g],A=u[g+1],I=e*f+p*2,x=l[I],T=l[I+1],b=Ic(n,t,d,x,i);r[p]=ho(b,M,A,T,y)}return r}};function ho(e,t,n,i,r){const s=1-e;return s*s*s*t+3*s*s*e*n+3*s*e*e*i+e*e*e*r}function Lc(e,t,n,i,r){const s=1-e;return 3*s*s*(n-t)+6*s*e*(i-n)+3*e*e*(r-i)}function Ic(e,t,n,i,r){let s=(e-t)/(r-t);for(let a=0;a<8;a++){const o=ho(s,t,n,i,r)-e;if(Math.abs(o)<1e-10)break;const c=Lc(s,t,n,i,r);if(Math.abs(c)<1e-10)break;s=Math.max(0,Math.min(1,s-o/c))}return s}var Zt=class{constructor(e,t,n,i){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Gn(t,this.TimeBufferType),this.values=Gn(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Gn(e.times,Array),values:Gn(e.values,Array)};const i=e.getInterpolation();i!==e.DefaultInterpolation&&(n.interpolation=i),Br(e.settings)&&(n.settings={inTangents:Gn(e.settings.inTangents,Array),outTangents:Gn(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Cc(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Rc(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new wc(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){const t=new Pc(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case rr:t=this.InterpolantFactoryMethodDiscrete;break;case Kr:t=this.InterpolantFactoryMethodLinear;break;case mr:t=this.InterpolantFactoryMethodSmooth;break;case vs:t=this.InterpolantFactoryMethodBezier}if(t===void 0){const n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return be("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return rr;case this.InterpolantFactoryMethodLinear:return Kr;case this.InterpolantFactoryMethodSmooth:return mr;case this.InterpolantFactoryMethodBezier:return vs}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e;Br(this.settings)&&(Zs(this.settings.inTangents,e),Zs(this.settings.outTangents,e))}return this}trim(e,t){const n=this.times,i=n.length;let r=0,s=i-1;for(;r!==i&&n[r]<e;)++r;for(;s!==-1&&n[s]>t;)--s;if(++s,r!==0||s!==i){r>=s&&(s=Math.max(s,1),r=s-1);const a=this.getValueSize();this.times=n.slice(r,s),this.values=this.values.slice(r*a,s*a)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(Ce("KeyframeTrack: Invalid value size in track.",this),e=!1);const n=this.times,i=this.values,r=n.length;r===0&&(Ce("KeyframeTrack: Track is empty.",this),e=!1);let s=null;for(let a=0;a!==r;a++){const o=n[a];if(typeof o=="number"&&isNaN(o)){Ce("KeyframeTrack: Time is not a valid number.",this,a,o),e=!1;break}if(s!==null&&s>o){Ce("KeyframeTrack: Out of order keys.",this,a,o,s),e=!1;break}s=o}if(i!==void 0&&Tl(i))for(let a=0,o=i.length;a!==o;++a){const c=i[a];if(isNaN(c)){Ce("KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===mr,r=e.length-1;let s=1;for(let a=1;a<r;++a){let o=!1;const c=e[a];if(c!==e[a+1]&&(a!==1||c!==e[0]))if(i)o=!0;else{const l=a*n,u=l-n,f=l+n;for(let h=0;h!==n;++h){const p=t[l+h];if(p!==t[u+h]||p!==t[f+h]){o=!0;break}}}if(o){if(a!==s){e[s]=e[a];const l=a*n,u=s*n;for(let f=0;f!==n;++f)t[u+f]=t[l+f]}++s}}if(r>0){e[s]=e[r];for(let a=r*n,o=s*n,c=0;c!==n;++c)t[o+c]=t[a+c];++s}return s!==e.length?(this.times=e.slice(0,s),this.values=t.slice(0,s*n)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),n=this.constructor,i=new n(this.name,e,t);return i.createInterpolant=this.createInterpolant,Br(this.settings)&&(i.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),i}};function Zs(e,t){for(let n=0,i=e.length;n!==i;n+=2)e[n]*=t}Zt.prototype.ValueTypeName="";Zt.prototype.TimeBufferType=Float32Array;Zt.prototype.ValueBufferType=Float32Array;Zt.prototype.DefaultInterpolation=Kr;var Ei=class extends Zt{constructor(e,t,n){super(e,t,n)}};Ei.prototype.ValueTypeName="bool";Ei.prototype.ValueBufferType=Array;Ei.prototype.DefaultInterpolation=rr;Ei.prototype.InterpolantFactoryMethodLinear=void 0;Ei.prototype.InterpolantFactoryMethodSmooth=void 0;var Dc=class extends Zt{constructor(e,t,n,i){super(e,t,n,i)}};Dc.prototype.ValueTypeName="color";var Uc=class extends Zt{constructor(e,t,n,i){super(e,t,n,i)}};Uc.prototype.ValueTypeName="number";var Nc=class extends yi{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const r=this.resultBuffer,s=this.sampleValues,a=this.valueSize,o=(n-t)/(i-t);let c=e*a;for(let l=c+a;c!==l;c+=4)bn.slerpFlat(r,0,s,c-a,s,c,o);return r}},uo=class extends Zt{constructor(e,t,n,i){super(e,t,n,i)}InterpolantFactoryMethodLinear(e){return new Nc(this.times,this.values,this.getValueSize(),e)}};uo.prototype.ValueTypeName="quaternion";uo.prototype.InterpolantFactoryMethodSmooth=void 0;var Ti=class extends Zt{constructor(e,t,n){super(e,t,n)}};Ti.prototype.ValueTypeName="string";Ti.prototype.ValueBufferType=Array;Ti.prototype.DefaultInterpolation=rr;Ti.prototype.InterpolantFactoryMethodLinear=void 0;Ti.prototype.InterpolantFactoryMethodSmooth=void 0;var Oc=class extends Zt{constructor(e,t,n,i){super(e,t,n,i)}};Oc.prototype.ValueTypeName="vector";var Fc=class{constructor(e,t,n){const i=this;let r=!1,s=0,a=0,o;const c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(l){a++,r===!1&&i.onStart!==void 0&&i.onStart(l,s,a),r=!0},this.itemEnd=function(l){s++,i.onProgress!==void 0&&i.onProgress(l,s,a),s===a&&(r=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(l){i.onError!==void 0&&i.onError(l)},this.resolveURL=function(l){return l=l.normalize("NFC"),o?o(l):l},this.setURLModifier=function(l){return o=l,this},this.addHandler=function(l,u){return c.push(l,u),this},this.removeHandler=function(l){const u=c.indexOf(l);return u!==-1&&c.splice(u,2),this},this.getHandler=function(l){for(let u=0,f=c.length;u<f;u+=2){const h=c[u],p=c[u+1];if(h.global&&(h.lastIndex=0),h.test(l))return p}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Bc=new Fc,zc=class{constructor(e){this.manager=e!==void 0?e:Bc,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){const n=this;return new Promise(function(i,r){n.load(e,i,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};zc.DEFAULT_MATERIAL_NAME="__DEFAULT";var ss=class extends Tt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new De(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},zr=new Qe,Js=new B,$s=new B,fo=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ze(512,512),this.mapType=fn,this.map=null,this.mapPass=null,this.matrix=new Qe,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new rs,this._frameExtents=new ze(1,1),this._viewportCount=1,this._viewports=[new rt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera;Js.setFromMatrixPosition(e.matrixWorld),t.position.copy(Js),$s.setFromMatrixPosition(e.target.matrixWorld),t.lookAt($s),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,i){zr.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(zr,e.coordinateSystem,e.reversedDepth);const r=this._frameExtents,s=i?i.z/r.x:1,a=i?i.w/r.y:1,o=i?i.x/r.x:0,c=i?i.y/r.y:0;e.coordinateSystem===2001||e.reversedDepth?t.set(.5*s,0,0,.5*s+o,0,.5*a,0,.5*a+c,0,0,1,0,0,0,0,1):t.set(.5*s,0,0,.5*s+o,0,.5*a,0,.5*a+c,0,0,.5,.5,0,0,0,1),t.multiply(zr)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Ji=new B,$i=new bn,Wt=new B,po=class extends Tt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Qe,this.projectionMatrix=new Qe,this.projectionMatrixInverse=new Qe,this.coordinateSystem=Qn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Ji,$i,Wt),Wt.x===1&&Wt.y===1&&Wt.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ji,$i,Wt.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(Ji,$i,Wt),Wt.x===1&&Wt.y===1&&Wt.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ji,$i,Wt.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},un=new B,Qs=new ze,js=new ze,Nt=class extends po{constructor(e=50,t=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Mi*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(mi*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Mi*2*Math.atan(Math.tan(mi*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){un.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(un.x,un.y).multiplyScalar(-e/un.z),un.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(un.x,un.y).multiplyScalar(-e/un.z)}getViewSize(e,t){return this.getViewBounds(e,Qs,js),t.subVectors(js,Qs)}setViewOffset(e,t,n,i,r,s){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=s,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(mi*.5*this.fov)/this.zoom,n=2*t,i=this.aspect*n,r=-.5*i;const s=this.view;if(this.view!==null&&this.view.enabled){const o=s.fullWidth,c=s.fullHeight;r+=s.offsetX*i/o,t-=s.offsetY*n/c,i*=s.width/o,n*=s.height/c}const a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+i,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Vc=class extends fo{constructor(){super(new Nt(90,1,.5,500)),this.isPointLightShadow=!0}},Gc=class extends ss{constructor(e,t,n=0,i=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new Vc}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}},as=class extends po{constructor(e=-1,t=1,n=1,i=-1,r=.1,s=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=r,this.far=s,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,r,s){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=s,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2;let r=n-e,s=n+e,a=i+t,o=i-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,l=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,s=r+c*this.view.width,a-=l*this.view.offsetY,o=a-l*this.view.height}this.projectionMatrix.makeOrthographic(r,s,a,o,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Hc=class extends fo{constructor(){super(new as(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Ad=class extends ss{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Tt.DEFAULT_UP),this.updateMatrix(),this.target=new Tt,this.shadow=new Hc}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}},wd=class extends ss{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}},Hn=-90,kn=1,kc=class extends Tt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const i=new Nt(Hn,kn,e,t);i.layers=this.layers,this.add(i);const r=new Nt(Hn,kn,e,t);r.layers=this.layers,this.add(r);const s=new Nt(Hn,kn,e,t);s.layers=this.layers,this.add(s);const a=new Nt(Hn,kn,e,t);a.layers=this.layers,this.add(a);const o=new Nt(Hn,kn,e,t);o.layers=this.layers,this.add(o);const c=new Nt(Hn,kn,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,i,r,s,a,o]=t;for(const c of t)this.remove(c);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),s.up.set(0,0,1),s.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),o.up.set(0,1,0),o.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),s.up.set(0,0,-1),s.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),o.up.set(0,-1,0),o.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,s,a,o,c,l]=this.children,u=e.getRenderTarget(),f=e.getActiveCubeFace(),h=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;const M=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let y=!1;e.isWebGLRenderer===!0?y=e.state.buffers.depth.getReversed():y=e.reversedDepthBuffer,e.setRenderTarget(n,0,i),y&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,i),y&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(n,2,i),y&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,3,i),y&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,4,i),y&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=M,e.setRenderTarget(n,5,i),y&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(u,f,h),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},Wc=class extends Nt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},Xc="\\[\\]\\.:\\/",qc=new RegExp("[\\[\\]\\.:\\/]","g"),os="[^\\[\\]\\.:\\/]",Yc="[^"+Xc.replace("\\.","")+"]",Kc=/((?:WC+[\/:])*)/.source.replace("WC",os),Zc=/(WCOD+)?/.source.replace("WCOD",Yc),Jc=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",os),$c=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",os),Qc=new RegExp("^"+Kc+Zc+Jc+$c+"$"),jc=["material","materials","bones","map"],eh=class{constructor(e,t,n){const i=n||it.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,i)}getValue(e,t){this.bind();const n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(e,t)}setValue(e,t){const n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,r=n.length;i!==r;++i)n[i].setValue(e,t)}bind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},it=class Kn{constructor(t,n,i){this.path=n,this.parsedPath=i||Kn.parseTrackName(n),this.node=Kn.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,i){return t&&t.isAnimationObjectGroup?new Kn.Composite(t,n,i):new Kn(t,n,i)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(qc,"")}static parseTrackName(t){const n=Qc.exec(t);if(n===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);const i={nodeName:n[2],objectName:n[3],objectIndex:n[4],propertyName:n[5],propertyIndex:n[6]},r=i.nodeName&&i.nodeName.lastIndexOf(".");if(r!==void 0&&r!==-1){const s=i.nodeName.substring(r+1);jc.indexOf(s)!==-1&&(i.nodeName=i.nodeName.substring(0,r),i.objectName=s)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return i}static findNode(t,n){if(n===void 0||n===""||n==="."||n===-1||n===t.name||n===t.uuid)return t;if(t.skeleton){const i=t.skeleton.getBoneByName(n);if(i!==void 0)return i}if(t.children){const i=function(s){for(let a=0;a<s.length;a++){const o=s[a];if(o.name===n||o.uuid===n)return o;const c=i(o.children);if(c)return c}return null},r=i(t.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,n){t[n]=this.targetObject[this.propertyName]}_getValue_array(t,n){const i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)t[n++]=i[r]}_getValue_arrayElement(t,n){t[n]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,n){this.resolvedProperty.toArray(t,n)}_setValue_direct(t,n){this.targetObject[this.propertyName]=t[n]}_setValue_direct_setNeedsUpdate(t,n){this.targetObject[this.propertyName]=t[n],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,n){this.targetObject[this.propertyName]=t[n],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,n){const i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=t[n++]}_setValue_array_setNeedsUpdate(t,n){const i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=t[n++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,n){const i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=t[n++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,n){this.resolvedProperty[this.propertyIndex]=t[n]}_setValue_arrayElement_setNeedsUpdate(t,n){this.resolvedProperty[this.propertyIndex]=t[n],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,n){this.resolvedProperty[this.propertyIndex]=t[n],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,n){this.resolvedProperty.fromArray(t,n)}_setValue_fromArray_setNeedsUpdate(t,n){this.resolvedProperty.fromArray(t,n),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,n){this.resolvedProperty.fromArray(t,n),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,n){this.bind(),this.getValue(t,n)}_setValue_unbound(t,n){this.bind(),this.setValue(t,n)}bind(){let t=this.node;const n=this.parsedPath,i=n.objectName,r=n.propertyName;let s=n.propertyIndex;if(t||(t=Kn.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){be("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let l=n.objectIndex;switch(i){case"materials":if(!t.material){Ce("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){Ce("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){Ce("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let u=0;u<t.length;u++)if(t[u].name===l){l=u;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){Ce("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){Ce("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[i]===void 0){Ce("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[i]}if(l!==void 0){if(t[l]===void 0){Ce("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[l]}}const a=t[r];if(a===void 0){const l=n.nodeName;Ce("PropertyBinding: Trying to update property for track: "+l+"."+r+" but it wasn't found.",t);return}let o=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?o=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(s!==void 0){if(r==="morphTargetInfluences"){if(!t.geometry){Ce("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){Ce("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[s]!==void 0&&(s=t.morphTargetDictionary[s])}c=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=s}else a.fromArray!==void 0&&a.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(c=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=r;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};it.Composite=eh;it.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};it.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};it.prototype.GetterByBindingType=[it.prototype._getValue_direct,it.prototype._getValue_array,it.prototype._getValue_arrayElement,it.prototype._getValue_toArray];it.prototype.SetterByBindingTypeAndVersioning=[[it.prototype._setValue_direct,it.prototype._setValue_direct_setNeedsUpdate,it.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[it.prototype._setValue_array,it.prototype._setValue_array_setNeedsUpdate,it.prototype._setValue_array_setMatrixWorldNeedsUpdate],[it.prototype._setValue_arrayElement,it.prototype._setValue_arrayElement_setNeedsUpdate,it.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[it.prototype._setValue_fromArray,it.prototype._setValue_fromArray_setNeedsUpdate,it.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Rd=class{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1,be("Clock: This module has been deprecated. Please use THREE.Timer instead.")}start(){this.startTime=performance.now(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const t=performance.now();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}},th=class{constructor(e,t,n,i){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,i)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,i){const r=this.elements;return r[0]=e,r[2]=t,r[1]=n,r[3]=i,this}};Ra=th;Ra.prototype.isMatrix2=!0;var Cd=class extends mc{constructor(e=10,t=10,n=4473924,i=8947848){n=new De(n),i=new De(i);const r=t/2,s=e/t,a=e/2,o=[],c=[];for(let f=0,h=0,p=-a;f<=t;f++,p+=s){o.push(-a,0,p,a,0,p),o.push(p,0,-a,p,0,a);const M=f===r?n:i;M.toArray(c,h),h+=3,M.toArray(c,h),h+=3,M.toArray(c,h),h+=3,M.toArray(c,h),h+=3}const l=new It;l.setAttribute("position",new st(o,3)),l.setAttribute("color",new st(c,3));const u=new ja({vertexColors:!0,toneMapped:!1});super(l,u),this.type="GridHelper"}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}};function ea(e,t,n,i){const r=nh(i);switch(n){case Fo:return e*t;case Fa:return e*t/r.components*r.byteLength;case Ba:return e*t/r.components*r.byteLength;case ir:return e*t*2/r.components*r.byteLength;case za:return e*t*2/r.components*r.byteLength;case Bo:return e*t*3/r.components*r.byteLength;case _i:return e*t*4/r.components*r.byteLength;case Va:return e*t*4/r.components*r.byteLength;case zo:case Vo:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case Go:case Ho:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Wo:case qo:return Math.max(e,16)*Math.max(t,8)/4;case ko:case Xo:return Math.max(e,8)*Math.max(t,8)/2;case Yo:case Ko:case Jo:case $o:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case Zo:case Qo:case jo:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case el:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case tl:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case nl:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case il:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case rl:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case sl:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case al:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case ol:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case ll:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case cl:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case hl:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case ul:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case dl:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case fl:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case pl:case ml:case gl:return Math.ceil(e/4)*Math.ceil(t/4)*16;case _l:case vl:return Math.ceil(e/4)*Math.ceil(t/4)*8;case Ml:case Sl:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${n} format.`)}function nh(e){switch(e){case fn:case Io:return{byteLength:1,components:1};case Ia:case Do:case pn:return{byteLength:2,components:1};case Da:case Ua:return{byteLength:2,components:4};case yn:case Uo:case xi:return{byteLength:4,components:1};case No:case Oo:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?be("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function mo(){let e=null,t=!1,n=null,i=null;function r(s,a){i=e.requestAnimationFrame(r),n(s,a)}return{start:function(){t!==!0&&n!==null&&e!==null&&(i=e.requestAnimationFrame(r),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(i),t=!1},setAnimationLoop:function(s){n=s},setContext:function(s){e=s}}}function ih(e){const t=new WeakMap;function n(o,c){const l=o.array,u=o.usage,f=l.byteLength,h=e.createBuffer();e.bindBuffer(c,h),e.bufferData(c,l,u),o.onUploadCallback();let p;if(l instanceof Float32Array)p=e.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)p=e.HALF_FLOAT;else if(l instanceof Uint16Array)o.isFloat16BufferAttribute?p=e.HALF_FLOAT:p=e.UNSIGNED_SHORT;else if(l instanceof Int16Array)p=e.SHORT;else if(l instanceof Uint32Array)p=e.UNSIGNED_INT;else if(l instanceof Int32Array)p=e.INT;else if(l instanceof Int8Array)p=e.BYTE;else if(l instanceof Uint8Array)p=e.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)p=e.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:h,type:p,bytesPerElement:l.BYTES_PER_ELEMENT,version:o.version,size:f}}function i(o,c,l){const u=c.array,f=c.updateRanges;if(e.bindBuffer(l,o),f.length===0)e.bufferSubData(l,0,u);else{f.sort((p,M)=>p.start-M.start);let h=0;for(let p=1;p<f.length;p++){const M=f[h],y=f[p];y.start<=M.start+M.count+1?M.count=Math.max(M.count,y.start+y.count-M.start):(++h,f[h]=y)}f.length=h+1;for(let p=0,M=f.length;p<M;p++){const y=f[p];e.bufferSubData(l,y.start*u.BYTES_PER_ELEMENT,u,y.start,y.count)}c.clearUpdateRanges()}c.onUploadCallback()}function r(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function s(o){o.isInterleavedBufferAttribute&&(o=o.data);const c=t.get(o);c&&(e.deleteBuffer(c.buffer),t.delete(o))}function a(o,c){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const u=t.get(o);(!u||u.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const l=t.get(o);if(l===void 0)t.set(o,n(o,c));else if(l.version<o.version){if(l.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(l.buffer,o,c),l.version=o.version}}return{get:r,remove:s,update:a}}var Oe={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,cube_uv_reflection_fragment:`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:"gl_FragColor = linearToOutputTexel( gl_FragColor );",colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,lightprobes_pars_fragment:`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distance_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distance_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},ce={common:{diffuse:{value:new De(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ie},alphaMap:{value:null},alphaMapTransform:{value:new Ie},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ie}},envmap:{envMap:{value:null},envMapRotation:{value:new Ie},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ie}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ie}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ie},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ie},normalScale:{value:new ze(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ie},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ie}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ie}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ie}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new De(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new B},probesMax:{value:new B},probesResolution:{value:new B}},points:{diffuse:{value:new De(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ie},alphaTest:{value:0},uvTransform:{value:new Ie}},sprite:{diffuse:{value:new De(16777215)},opacity:{value:1},center:{value:new ze(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ie},alphaMap:{value:null},alphaMapTransform:{value:new Ie},alphaTest:{value:0}}},qt={basic:{uniforms:yt([ce.common,ce.specularmap,ce.envmap,ce.aomap,ce.lightmap,ce.fog]),vertexShader:Oe.meshbasic_vert,fragmentShader:Oe.meshbasic_frag},lambert:{uniforms:yt([ce.common,ce.specularmap,ce.envmap,ce.aomap,ce.lightmap,ce.emissivemap,ce.bumpmap,ce.normalmap,ce.displacementmap,ce.fog,ce.lights,{emissive:{value:new De(0)},envMapIntensity:{value:1}}]),vertexShader:Oe.meshlambert_vert,fragmentShader:Oe.meshlambert_frag},phong:{uniforms:yt([ce.common,ce.specularmap,ce.envmap,ce.aomap,ce.lightmap,ce.emissivemap,ce.bumpmap,ce.normalmap,ce.displacementmap,ce.fog,ce.lights,{emissive:{value:new De(0)},specular:{value:new De(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Oe.meshphong_vert,fragmentShader:Oe.meshphong_frag},standard:{uniforms:yt([ce.common,ce.envmap,ce.aomap,ce.lightmap,ce.emissivemap,ce.bumpmap,ce.normalmap,ce.displacementmap,ce.roughnessmap,ce.metalnessmap,ce.fog,ce.lights,{emissive:{value:new De(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Oe.meshphysical_vert,fragmentShader:Oe.meshphysical_frag},toon:{uniforms:yt([ce.common,ce.aomap,ce.lightmap,ce.emissivemap,ce.bumpmap,ce.normalmap,ce.displacementmap,ce.gradientmap,ce.fog,ce.lights,{emissive:{value:new De(0)}}]),vertexShader:Oe.meshtoon_vert,fragmentShader:Oe.meshtoon_frag},matcap:{uniforms:yt([ce.common,ce.bumpmap,ce.normalmap,ce.displacementmap,ce.fog,{matcap:{value:null}}]),vertexShader:Oe.meshmatcap_vert,fragmentShader:Oe.meshmatcap_frag},points:{uniforms:yt([ce.points,ce.fog]),vertexShader:Oe.points_vert,fragmentShader:Oe.points_frag},dashed:{uniforms:yt([ce.common,ce.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Oe.linedashed_vert,fragmentShader:Oe.linedashed_frag},depth:{uniforms:yt([ce.common,ce.displacementmap]),vertexShader:Oe.depth_vert,fragmentShader:Oe.depth_frag},normal:{uniforms:yt([ce.common,ce.bumpmap,ce.normalmap,ce.displacementmap,{opacity:{value:1}}]),vertexShader:Oe.meshnormal_vert,fragmentShader:Oe.meshnormal_frag},sprite:{uniforms:yt([ce.sprite,ce.fog]),vertexShader:Oe.sprite_vert,fragmentShader:Oe.sprite_frag},background:{uniforms:{uvTransform:{value:new Ie},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Oe.background_vert,fragmentShader:Oe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ie}},vertexShader:Oe.backgroundCube_vert,fragmentShader:Oe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Oe.cube_vert,fragmentShader:Oe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Oe.equirect_vert,fragmentShader:Oe.equirect_frag},distance:{uniforms:yt([ce.common,ce.displacementmap,{referencePosition:{value:new B},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Oe.distance_vert,fragmentShader:Oe.distance_frag},shadow:{uniforms:yt([ce.lights,ce.fog,{color:{value:new De(0)},opacity:{value:1}}]),vertexShader:Oe.shadow_vert,fragmentShader:Oe.shadow_frag}};qt.physical={uniforms:yt([qt.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ie},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ie},clearcoatNormalScale:{value:new ze(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ie},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ie},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ie},sheen:{value:0},sheenColor:{value:new De(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ie},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ie},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ie},transmissionSamplerSize:{value:new ze},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ie},attenuationDistance:{value:0},attenuationColor:{value:new De(0)},specularColor:{value:new De(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ie},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ie},anisotropyVector:{value:new ze},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ie}}]),vertexShader:Oe.meshphysical_vert,fragmentShader:Oe.meshphysical_frag};var Qi={r:0,b:0,g:0},rh=new Qe,go=new Ie;go.set(-1,0,0,0,1,0,0,0,1);function sh(e,t,n,i,r,s){const a=new De(0);let o=r===!0?0:1,c,l,u=null,f=0,h=null;function p(A){let I=A.isScene===!0?A.background:null;if(I&&I.isTexture){const x=A.backgroundBlurriness>0;I=t.get(I,x)}return I}function M(A){let I=!1;const x=p(A);x===null?g(a,o):x&&x.isColor&&(g(x,1),I=!0);const T=e.xr.getEnvironmentBlendMode();T==="additive"?n.buffers.color.setClear(0,0,0,1,s):T==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,s),(e.autoClear||I)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function y(A,I){const x=p(I);x&&(x.isCubeTexture||x.mapping===306)?(l===void 0&&(l=new gt(new hr(1,1,1),new Kt({name:"BackgroundCubeMaterial",uniforms:ei(qt.backgroundCube.uniforms),vertexShader:qt.backgroundCube.vertexShader,fragmentShader:qt.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),l.geometry.deleteAttribute("uv"),l.onBeforeRender=function(T,b,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(l)),l.material.uniforms.envMap.value=x,l.material.uniforms.backgroundBlurriness.value=I.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=I.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(rh.makeRotationFromEuler(I.backgroundRotation)).transpose(),x.isCubeTexture&&x.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(go),l.material.toneMapped=Ge.getTransfer(x.colorSpace)!==ar,(u!==x||f!==x.version||h!==e.toneMapping)&&(l.material.needsUpdate=!0,u=x,f=x.version,h=e.toneMapping),l.layers.enableAll(),A.unshift(l,l.geometry,l.material,0,0,null)):x&&x.isTexture&&(c===void 0&&(c=new gt(new so(2,2),new Kt({name:"BackgroundMaterial",uniforms:ei(qt.background.uniforms),vertexShader:qt.background.vertexShader,fragmentShader:qt.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(c)),c.material.uniforms.t2D.value=x,c.material.uniforms.backgroundIntensity.value=I.backgroundIntensity,c.material.toneMapped=Ge.getTransfer(x.colorSpace)!==ar,x.matrixAutoUpdate===!0&&x.updateMatrix(),c.material.uniforms.uvTransform.value.copy(x.matrix),(u!==x||f!==x.version||h!==e.toneMapping)&&(c.material.needsUpdate=!0,u=x,f=x.version,h=e.toneMapping),c.layers.enableAll(),A.unshift(c,c.geometry,c.material,0,0,null))}function g(A,I){A.getRGB(Qi,co(e)),n.buffers.color.setClear(Qi.r,Qi.g,Qi.b,I,s)}function d(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return a},setClearColor:function(A,I=1){a.set(A),o=I,g(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(A){o=A,g(a,o)},render:M,addToRenderList:y,dispose:d}}function ah(e,t){const n=e.getParameter(e.MAX_VERTEX_ATTRIBS),i={},r=h(null);let s=r,a=!1;function o(U,O,Y,D,V){let J=!1;const H=f(U,D,Y,O);s!==H&&(s=H,l(s.object)),J=p(U,D,Y,V),J&&M(U,D,Y,V),V!==null&&t.update(V,e.ELEMENT_ARRAY_BUFFER),(J||a)&&(a=!1,x(U,O,Y,D),V!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(V).buffer))}function c(){return e.createVertexArray()}function l(U){return e.bindVertexArray(U)}function u(U){return e.deleteVertexArray(U)}function f(U,O,Y,D){const V=D.wireframe===!0;let J=i[O.id];J===void 0&&(J={},i[O.id]=J);const H=U.isInstancedMesh===!0?U.id:0;let oe=J[H];oe===void 0&&(oe={},J[H]=oe);let X=oe[Y.id];X===void 0&&(X={},oe[Y.id]=X);let K=X[V];return K===void 0&&(K=h(c()),X[V]=K),K}function h(U){const O=[],Y=[],D=[];for(let V=0;V<n;V++)O[V]=0,Y[V]=0,D[V]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:O,enabledAttributes:Y,attributeDivisors:D,object:U,attributes:{},index:null}}function p(U,O,Y,D){const V=s.attributes,J=O.attributes;let H=0;const oe=Y.getAttributes();for(const X in oe)if(oe[X].location>=0){const K=V[X];let $=J[X];if($===void 0&&(X==="instanceMatrix"&&U.instanceMatrix&&($=U.instanceMatrix),X==="instanceColor"&&U.instanceColor&&($=U.instanceColor)),K===void 0||K.attribute!==$||$&&K.data!==$.data)return!0;H++}return s.attributesNum!==H||s.index!==D}function M(U,O,Y,D){const V={},J=O.attributes;let H=0;const oe=Y.getAttributes();for(const X in oe)if(oe[X].location>=0){let K=J[X];K===void 0&&(X==="instanceMatrix"&&U.instanceMatrix&&(K=U.instanceMatrix),X==="instanceColor"&&U.instanceColor&&(K=U.instanceColor));const $={};$.attribute=K,K&&K.data&&($.data=K.data),V[X]=$,H++}s.attributes=V,s.attributesNum=H,s.index=D}function y(){const U=s.newAttributes;for(let O=0,Y=U.length;O<Y;O++)U[O]=0}function g(U){d(U,0)}function d(U,O){const Y=s.newAttributes,D=s.enabledAttributes,V=s.attributeDivisors;Y[U]=1,D[U]===0&&(e.enableVertexAttribArray(U),D[U]=1),V[U]!==O&&(e.vertexAttribDivisor(U,O),V[U]=O)}function A(){const U=s.newAttributes,O=s.enabledAttributes;for(let Y=0,D=O.length;Y<D;Y++)O[Y]!==U[Y]&&(e.disableVertexAttribArray(Y),O[Y]=0)}function I(U,O,Y,D,V,J,H){H===!0?e.vertexAttribIPointer(U,O,Y,V,J):e.vertexAttribPointer(U,O,Y,D,V,J)}function x(U,O,Y,D){y();const V=D.attributes,J=Y.getAttributes(),H=O.defaultAttributeValues;for(const oe in J){const X=J[oe];if(X.location>=0){let K=V[oe];if(K===void 0&&(oe==="instanceMatrix"&&U.instanceMatrix&&(K=U.instanceMatrix),oe==="instanceColor"&&U.instanceColor&&(K=U.instanceColor)),K!==void 0){const $=K.normalized,Ne=K.itemSize,ye=t.get(K);if(ye===void 0)continue;const je=ye.buffer,Ue=ye.type,q=ye.bytesPerElement,ne=Ue===e.INT||Ue===e.UNSIGNED_INT||K.gpuType===1013;if(K.isInterleavedBufferAttribute){const ae=K.data,Te=ae.stride,Re=K.offset;if(ae.isInstancedInterleavedBuffer){for(let de=0;de<X.locationSize;de++)d(X.location+de,ae.meshPerAttribute);U.isInstancedMesh!==!0&&D._maxInstanceCount===void 0&&(D._maxInstanceCount=ae.meshPerAttribute*ae.count)}else for(let de=0;de<X.locationSize;de++)g(X.location+de);e.bindBuffer(e.ARRAY_BUFFER,je);for(let de=0;de<X.locationSize;de++)I(X.location+de,Ne/X.locationSize,Ue,$,Te*q,(Re+Ne/X.locationSize*de)*q,ne)}else{if(K.isInstancedBufferAttribute){for(let ae=0;ae<X.locationSize;ae++)d(X.location+ae,K.meshPerAttribute);U.isInstancedMesh!==!0&&D._maxInstanceCount===void 0&&(D._maxInstanceCount=K.meshPerAttribute*K.count)}else for(let ae=0;ae<X.locationSize;ae++)g(X.location+ae);e.bindBuffer(e.ARRAY_BUFFER,je);for(let ae=0;ae<X.locationSize;ae++)I(X.location+ae,Ne/X.locationSize,Ue,$,Ne*q,Ne/X.locationSize*ae*q,ne)}}else if(H!==void 0){const $=H[oe];if($!==void 0)switch($.length){case 2:e.vertexAttrib2fv(X.location,$);break;case 3:e.vertexAttrib3fv(X.location,$);break;case 4:e.vertexAttrib4fv(X.location,$);break;default:e.vertexAttrib1fv(X.location,$)}}}}A()}function T(){E();for(const U in i){const O=i[U];for(const Y in O){const D=O[Y];for(const V in D){const J=D[V];for(const H in J)u(J[H].object),delete J[H];delete D[V]}}delete i[U]}}function b(U){if(i[U.id]===void 0)return;const O=i[U.id];for(const Y in O){const D=O[Y];for(const V in D){const J=D[V];for(const H in J)u(J[H].object),delete J[H];delete D[V]}}delete i[U.id]}function w(U){for(const O in i){const Y=i[O];for(const D in Y){const V=Y[D];if(V[U.id]===void 0)continue;const J=V[U.id];for(const H in J)u(J[H].object),delete J[H];delete V[U.id]}}}function _(U){for(const O in i){const Y=i[O],D=U.isInstancedMesh===!0?U.id:0,V=Y[D];if(V!==void 0){for(const J in V){const H=V[J];for(const oe in H)u(H[oe].object),delete H[oe];delete V[J]}delete Y[D],Object.keys(Y).length===0&&delete i[O]}}}function E(){G(),a=!0,s!==r&&(s=r,l(s.object))}function G(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:o,reset:E,resetDefaultState:G,dispose:T,releaseStatesOfGeometry:b,releaseStatesOfObject:_,releaseStatesOfProgram:w,initAttributes:y,enableAttribute:g,disableUnusedAttributes:A}}function oh(e,t,n){let i;function r(c){i=c}function s(c,l){e.drawArrays(i,c,l),n.update(l,i,1)}function a(c,l,u){u!==0&&(e.drawArraysInstanced(i,c,l,u),n.update(l,i,u))}function o(c,l,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,l,0,u);let f=0;for(let h=0;h<u;h++)f+=l[h];n.update(f,i,1)}this.setMode=r,this.render=s,this.renderInstances=a,this.renderMultiDraw=o}function lh(e,t,n,i){let r;function s(){if(r!==void 0)return r;if(t.has("EXT_texture_filter_anisotropic")===!0){const w=t.get("EXT_texture_filter_anisotropic");r=e.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function a(w){return!(w!==1023&&i.convert(w)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(w){const _=w===1016&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(w!==1009&&w!==1015&&!_&&i.convert(w)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE))}function c(w){if(w==="highp"){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=n.precision!==void 0?n.precision:"highp";const u=c(l);u!==l&&(be("WebGLRenderer:",l,"not supported, using",u,"instead."),l=u);const f=n.logarithmicDepthBuffer===!0,h=n.reversedDepthBuffer===!0&&t.has("EXT_clip_control");n.reversedDepthBuffer===!0&&h===!1&&be("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");const p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),M=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),y=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),d=e.getParameter(e.MAX_VERTEX_ATTRIBS),A=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),I=e.getParameter(e.MAX_VARYING_VECTORS),x=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),T=e.getParameter(e.MAX_SAMPLES),b=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:c,textureFormatReadable:a,textureTypeReadable:o,precision:l,logarithmicDepthBuffer:f,reversedDepthBuffer:h,maxTextures:p,maxVertexTextures:M,maxTextureSize:y,maxCubemapSize:g,maxAttributes:d,maxVertexUniforms:A,maxVaryings:I,maxFragmentUniforms:x,maxSamples:T,samples:b}}function ch(e){const t=this;let n=null,i=0,r=!1,s=!1;const a=new dn,o=new Ie,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(f,h){const p=f.length!==0||h||i!==0||r;return r=h,i=f.length,p},this.beginShadows=function(){s=!0,u(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(f,h){n=u(f,h,0)},this.setState=function(f,h,p){const M=f.clippingPlanes,y=f.clipIntersection,g=f.clipShadows,d=e.get(f);if(!r||M===null||M.length===0||s&&!g)s?u(null):l();else{const A=s?0:i,I=A*4;let x=d.clippingState||null;c.value=x,x=u(M,h,I,p);for(let T=0;T!==I;++T)x[T]=n[T];d.clippingState=x,this.numIntersection=y?this.numPlanes:0,this.numPlanes+=A}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=i>0),t.numPlanes=i,t.numIntersection=0}function u(f,h,p,M){const y=f!==null?f.length:0;let g=null;if(y!==0){if(g=c.value,M!==!0||g===null){const d=p+y*4,A=h.matrixWorldInverse;o.getNormalMatrix(A),(g===null||g.length<d)&&(g=new Float32Array(d));for(let I=0,x=p;I!==y;++I,x+=4)a.copy(f[I]).applyMatrix4(A,o),a.normal.toArray(g,x),g[x+3]=a.constant}c.value=g,c.needsUpdate=!0}return t.numPlanes=y,t.numIntersection=0,g}}var Zn=4,hh=6,uh=20,dh=256,di=new as,ta=new De,Vr=null,Gr=0,Hr=0,kr=!1,fh=new B,xn=new B,na=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,i=100,r={}){const{size:s=256,position:a=fh}=r;Vr=this._renderer.getRenderTarget(),Gr=this._renderer.getActiveCubeFace(),Hr=this._renderer.getActiveMipmapLevel(),kr=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(s);const o=this._allocateTargets();return o.depthBuffer=!0,this._sceneToCubeUV(e,n,i,o,a),t>0&&this._blur(o,0,0,t),this._applyPMREM(o),this._cleanup(o),o}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=sa(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=ra(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Vr,Gr,Hr),this._renderer.xr.enabled=kr,e.scissorTest=!1,Wn(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Vr=this._renderer.getRenderTarget(),Gr=this._renderer.getActiveCubeFace(),Hr=this._renderer.getActiveMipmapLevel(),kr=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Lt,minFilter:Lt,generateMipmaps:!1,type:pn,format:_i,colorSpace:Zr,depthBuffer:!1},i=ia(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=ia(e,t,n);const{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=ph(r)),this._blurMaterial=gh(r,e,t),this._ggxMaterial=mh(r,e,t)}return i}_compileMaterial(e){const t=new gt(new It,e);this._renderer.compile(t,di)}_sceneToCubeUV(e,t,n,i,r){const s=new Nt(90,1,t,n),a=[1,-1,1,1,1,1],o=[1,1,1,-1,-1,-1],c=this._renderer,l=c.autoClear,u=c.toneMapping;c.getClearColor(ta),c.toneMapping=0,c.autoClear=!1,c.state.buffers.depth.getReversed()&&(c.setRenderTarget(i),c.clearDepth(),c.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new gt(new hr,new $a({name:"PMREM.Background",side:1,depthWrite:!1,depthTest:!1})));const f=this._backgroundBox,h=f.material;let p=!1;const M=e.background;M?M.isColor&&(h.color.copy(M),e.background=null,p=!0):(h.color.copy(ta),p=!0);for(let y=0;y<6;y++){const g=y%3;g===0?(s.up.set(0,a[y],0),s.position.set(r.x,r.y,r.z),s.lookAt(r.x+o[y],r.y,r.z)):g===1?(s.up.set(0,0,a[y]),s.position.set(r.x,r.y,r.z),s.lookAt(r.x,r.y+o[y],r.z)):(s.up.set(0,a[y],0),s.position.set(r.x,r.y,r.z),s.lookAt(r.x,r.y,r.z+o[y]));const d=this._cubeSize;Wn(i,g*d,y>2?d:0,d,d),c.setRenderTarget(i),p&&c.render(f,s),c.render(e,s)}c.toneMapping=u,c.autoClear=l,e.background=M}_textureToCubeUV(e,t){const n=this._renderer,i=e.mapping===301||e.mapping===302;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=sa()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=ra());const r=i?this._cubemapMaterial:this._equirectMaterial,s=this._lodMeshes[0];s.material=r;const a=r.uniforms;a.envMap.value=e;const o=this._cubeSize;Wn(t,0,0,3*o,2*o),n.setRenderTarget(t),n.render(s,di)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const i=this._lodMeshes.length;for(let r=1;r<i;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=n}_applyGGXFilter(e,t,n){const i=this._renderer,r=this._pingPongRenderTarget,s=this._ggxMaterial,a=this._lodMeshes[n];a.material=s;const o=s.uniforms,c=n/(this._lodMeshes.length-1),l=t/(this._lodMeshes.length-1),u=Math.sqrt(c*c-l*l)*(c*1.25),{_lodMax:f}=this,h=this._sizeLods[n],p=3*h*(n>f-Zn?n-f+Zn:0),M=4*(this._cubeSize-h);o.envMap.value=e.texture,o.roughness.value=u,o.mipInt.value=f-t,Wn(r,p,M,3*h,2*h),i.setRenderTarget(r),i.render(a,di),o.envMap.value=r.texture,o.roughness.value=0,o.mipInt.value=f-n,Wn(e,p,M,3*h,2*h),i.setRenderTarget(e),i.render(a,di)}_blur(e,t,n,i){const r=this._pingPongRenderTarget,s=Math.min(i,Math.PI)/Math.SQRT2;this._blurPass(e,r,t,n,s),this._blurPass(r,e,n,n,s)}_blurPass(e,t,n,i,r){const s=this._renderer,a=this._blurMaterial,o=this._lodMeshes[i];o.material=a;const c=a.uniforms;c.envMap.value=e.texture,c.sigma.value=r,c.mipInt.value=this._lodMax-n;const l=this._sizeLods[i];Wn(t,3*l*(i>this._lodMax-Zn?i-this._lodMax+Zn:0),4*(this._cubeSize-l),3*l,2*l),s.setRenderTarget(t),s.render(o,di)}};function ph(e){const t=[],n=[];let i=e;const r=e-Zn+1+hh;for(let s=0;s<r;s++){const a=Math.pow(2,i);t.push(a);const o=1/(a-2),c=-o,l=1+o,u=[c,c,l,c,l,l,c,c,l,l,c,l],f=6,h=6,p=3,M=new Float32Array(108),y=new Float32Array(108);for(let d=0;d<f;d++){const A=d%3*2/3-1,I=d>2?0:-1,x=[A,I,0,A+2/3,I,0,A+2/3,I+1,0,A,I,0,A+2/3,I+1,0,A,I+1,0];M.set(x,18*d);for(let T=0;T<h;T++){const b=u[T*2]*2-1,w=u[T*2+1]*2-1;d===0?xn.set(1,w,b):d===1?xn.set(-b,1,-w):d===2?xn.set(-b,w,1):d===3?xn.set(-1,w,-b):d===4?xn.set(-b,-1,w):xn.set(b,w,-1),xn.toArray(y,(d*h+T)*p)}}const g=new It;g.setAttribute("position",new Yt(M,p)),g.setAttribute("outputDirection",new Yt(y,p)),n.push(new gt(g,null)),i>Zn&&i--}return{lodMeshes:n,sizeLods:t}}function ia(e,t,n){const i=new Vt(e,t,n);return i.texture.mapping=306,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Wn(e,t,n,i,r){e.viewport.set(t,n,i,r),e.scissor.set(t,n,i,r)}function mh(e,t,n){return new Kt({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:dh,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:ur(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function gh(e,t,n){return new Kt({name:"SphericalGaussianBlur",defines:{SAMPLES:uh,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:ur(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function ra(){return new Kt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:ur(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function sa(){return new Kt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:ur(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function ur(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var _o=class extends Vt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},i=[n,n,n,n,n,n];this.texture=new eo(i),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new hr(5,5,5),r=new Kt({name:"CubemapFromEquirect",uniforms:ei(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});r.uniforms.tEquirect.value=t;const s=new gt(i,r),a=t.minFilter;return t.minFilter===1008&&(t.minFilter=Lt),new kc(1,10,this).update(e,s),t.minFilter=a,s.geometry.dispose(),s.material.dispose(),this}clear(e,t=!0,n=!0,i=!0){const r=e.getRenderTarget();for(let s=0;s<6;s++)e.setRenderTarget(this,s),e.clear(t,n,i);e.setRenderTarget(r)}};function _h(e){let t=new WeakMap,n=new WeakMap,i=null;function r(h,p=!1){return h==null?null:p?a(h):s(h)}function s(h){if(h&&h.isTexture){const p=h.mapping;if(p===303||p===304)if(t.has(h)){const M=t.get(h).texture;return o(M,h.mapping)}else{const M=h.image;if(M&&M.height>0){const y=new _o(M.height);return y.fromEquirectangularTexture(e,h),t.set(h,y),h.addEventListener("dispose",l),o(y.texture,h.mapping)}else return null}}return h}function a(h){if(h&&h.isTexture){const p=h.mapping,M=p===303||p===304,y=p===301||p===302;if(M||y){let g=n.get(h);const d=g!==void 0?g.texture.pmremVersion:0;if(h.isRenderTargetTexture&&h.pmremVersion!==d)return i===null&&(i=new na(e)),g=M?i.fromEquirectangular(h,g):i.fromCubemap(h,g),g.texture.pmremVersion=h.pmremVersion,n.set(h,g),g.texture;if(g!==void 0)return g.texture;{const A=h.image;return M&&A&&A.height>0||y&&A&&c(A)?(i===null&&(i=new na(e)),g=M?i.fromEquirectangular(h):i.fromCubemap(h),g.texture.pmremVersion=h.pmremVersion,n.set(h,g),h.addEventListener("dispose",u),g.texture):null}}}return h}function o(h,p){return p===303?h.mapping=301:p===304&&(h.mapping=302),h}function c(h){let p=0;const M=6;for(let y=0;y<M;y++)h[y]!==void 0&&p++;return p===M}function l(h){const p=h.target;p.removeEventListener("dispose",l);const M=t.get(p);M!==void 0&&(t.delete(p),M.dispose())}function u(h){const p=h.target;p.removeEventListener("dispose",u);const M=n.get(p);M!==void 0&&(n.delete(p),M.dispose())}function f(){t=new WeakMap,n=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:r,dispose:f}}function vh(e){const t={};function n(i){if(t[i]!==void 0)return t[i];const r=e.getExtension(i);return t[i]=r,r}return{has:function(i){return n(i)!==null},init:function(){n("EXT_color_buffer_float"),n("WEBGL_clip_cull_distance"),n("OES_texture_float_linear"),n("EXT_color_buffer_half_float"),n("WEBGL_multisampled_render_to_texture"),n("WEBGL_render_shared_exponent")},get:function(i){const r=n(i);return r===null&&Jn("WebGLRenderer: "+i+" extension not supported."),r}}}function Mh(e,t,n,i){const r={},s=new WeakMap;function a(f){const h=f.target;h.index!==null&&t.remove(h.index);for(const M in h.attributes)t.remove(h.attributes[M]);h.removeEventListener("dispose",a),delete r[h.id];const p=s.get(h);p&&(t.remove(p),s.delete(h)),i.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0&&delete h._maxInstanceCount,n.memory.geometries--}function o(f,h){return r[h.id]===!0||(h.addEventListener("dispose",a),r[h.id]=!0,n.memory.geometries++),h}function c(f){const h=f.attributes;for(const p in h)t.update(h[p],e.ARRAY_BUFFER)}function l(f){const h=[],p=f.index,M=f.attributes.position;let y=0;if(M===void 0)return;if(p!==null){const A=p.array;y=p.version;for(let I=0,x=A.length;I<x;I+=3){const T=A[I+0],b=A[I+1],w=A[I+2];h.push(T,b,b,w,w,T)}}else{const A=M.array;y=M.version;for(let I=0,x=A.length/3-1;I<x;I+=3){const T=I+0,b=I+1,w=I+2;h.push(T,b,b,w,w,T)}}const g=new(M.count>=65535?Za:Ka)(h,1);g.version=y;const d=s.get(f);d&&t.remove(d),s.set(f,g)}function u(f){const h=s.get(f);if(h){const p=f.index;p!==null&&h.version<p.version&&l(f)}else l(f);return s.get(f)}return{get:o,update:c,getWireframeAttribute:u}}function Sh(e,t,n){let i;function r(f){i=f}let s,a;function o(f){s=f.type,a=f.bytesPerElement}function c(f,h){e.drawElements(i,h,s,f*a),n.update(h,i,1)}function l(f,h,p){p!==0&&(e.drawElementsInstanced(i,h,s,f*a,p),n.update(h,i,p))}function u(f,h,p){if(p===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,h,0,s,f,0,p);let M=0;for(let y=0;y<p;y++)M+=h[y];n.update(M,i,1)}this.setMode=r,this.setIndex=o,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function xh(e){const t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,a,o){switch(n.calls++,a){case e.TRIANGLES:n.triangles+=o*(s/3);break;case e.LINES:n.lines+=o*(s/2);break;case e.LINE_STRIP:n.lines+=o*(s-1);break;case e.LINE_LOOP:n.lines+=o*s;break;case e.POINTS:n.points+=o*s;break;default:Ce("WebGLInfo: Unknown draw mode:",a)}}function r(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:r,update:i}}function yh(e,t,n){const i=new WeakMap,r=new rt;function s(a,o,c){const l=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,f=u!==void 0?u.length:0;let h=i.get(o);if(h===void 0||h.count!==f){let E=function(){w.dispose(),i.delete(o),o.removeEventListener("dispose",E)};h!==void 0&&h.texture.dispose();const p=o.morphAttributes.position!==void 0,M=o.morphAttributes.normal!==void 0,y=o.morphAttributes.color!==void 0,g=o.morphAttributes.position||[],d=o.morphAttributes.normal||[],A=o.morphAttributes.color||[];let I=0;p===!0&&(I=1),M===!0&&(I=2),y===!0&&(I=3);let x=o.attributes.position.count*I,T=1;x>t.maxTextureSize&&(T=Math.ceil(x/t.maxTextureSize),x=t.maxTextureSize);const b=new Float32Array(x*T*4*f),w=new Ha(b,x,T,f);w.type=xi,w.needsUpdate=!0;const _=I*4;for(let G=0;G<f;G++){const U=g[G],O=d[G],Y=A[G],D=x*T*4*G;for(let V=0;V<U.count;V++){const J=V*_;p===!0&&(r.fromBufferAttribute(U,V),b[D+J+0]=r.x,b[D+J+1]=r.y,b[D+J+2]=r.z,b[D+J+3]=0),M===!0&&(r.fromBufferAttribute(O,V),b[D+J+4]=r.x,b[D+J+5]=r.y,b[D+J+6]=r.z,b[D+J+7]=0),y===!0&&(r.fromBufferAttribute(Y,V),b[D+J+8]=r.x,b[D+J+9]=r.y,b[D+J+10]=r.z,b[D+J+11]=Y.itemSize===4?r.w:1)}}h={count:f,texture:w,size:new ze(x,T)},i.set(o,h),o.addEventListener("dispose",E)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)c.getUniforms().setValue(e,"morphTexture",a.morphTexture,n);else{let p=0;for(let y=0;y<l.length;y++)p+=l[y];const M=o.morphTargetsRelative?1:1-p;c.getUniforms().setValue(e,"morphTargetBaseInfluence",M),c.getUniforms().setValue(e,"morphTargetInfluences",l)}c.getUniforms().setValue(e,"morphTargetsTexture",h.texture,n),c.getUniforms().setValue(e,"morphTargetsTextureSize",h.size)}return{update:s}}function Eh(e,t,n,i,r){let s=new WeakMap;function a(l){const u=r.render.frame,f=l.geometry,h=t.get(l,f);if(s.get(h)!==u&&(t.update(h),s.set(h,u)),l.isInstancedMesh&&(l.hasEventListener("dispose",c)===!1&&l.addEventListener("dispose",c),s.get(l)!==u&&(n.update(l.instanceMatrix,e.ARRAY_BUFFER),l.instanceColor!==null&&n.update(l.instanceColor,e.ARRAY_BUFFER),s.set(l,u))),l.isSkinnedMesh){const p=l.skeleton;s.get(p)!==u&&(p.update(),s.set(p,u))}return h}function o(){s=new WeakMap}function c(l){const u=l.target;u.removeEventListener("dispose",c),i.releaseStatesOfObject(u),n.remove(u.instanceMatrix),u.instanceColor!==null&&n.remove(u.instanceColor)}return{update:a,dispose:o}}var Th={1:"LINEAR_TONE_MAPPING",2:"REINHARD_TONE_MAPPING",3:"CINEON_TONE_MAPPING",4:"ACES_FILMIC_TONE_MAPPING",6:"AGX_TONE_MAPPING",7:"NEUTRAL_TONE_MAPPING",5:"CUSTOM_TONE_MAPPING"};function bh(e,t,n,i,r,s){const a=new Vt(t,n,{type:e,depthBuffer:r,stencilBuffer:s,samples:i?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1});let o=null,c=null;const l=new It;l.setAttribute("position",new st([-1,3,0,-1,-1,0,3,-1,0],3)),l.setAttribute("uv",new st([0,2,0,0,2,0],2));const u=new Ec({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),f=new gt(l,u),h=new as(-1,1,1,-1,0,1);let p=null,M=null,y=!1,g,d=null,A=[],I=!1;this.setSize=function(x,T){a.setSize(x,T),o!==null&&o.setSize(x,T),c!==null&&c.setSize(x,T);for(let b=0;b<A.length;b++){const w=A[b];w.setSize&&w.setSize(x,T)}},this.setEffects=function(x){A=x,I=A.length>0&&A[0].isRenderPass===!0;const T=a.width,b=a.height;A.length>0&&o===null&&(o=new Vt(T,b,{type:pn,depthBuffer:!1,stencilBuffer:!1}),c=new Vt(T,b,{type:pn,depthBuffer:!1,stencilBuffer:!1}));for(let w=0;w<A.length;w++){const _=A[w];_.setSize&&_.setSize(T,b)}},this.begin=function(x,T){if(y||x.toneMapping===0&&A.length===0)return!1;if(d=T,T!==null){const b=T.width,w=T.height;(a.width!==b||a.height!==w)&&this.setSize(b,w)}return I===!1&&x.setRenderTarget(a),g=x.toneMapping,x.toneMapping=0,!0},this.hasRenderPass=function(){return I},this.end=function(x,T){x.toneMapping=g,y=!0;let b=a,w=o;for(let _=0;_<A.length;_++){const E=A[_];E.enabled!==!1&&(E.render(x,w,b,T),E.needsSwap!==!1&&(b=w,w=w===o?c:o))}if(p!==x.outputColorSpace||M!==x.toneMapping){p=x.outputColorSpace,M=x.toneMapping,u.defines={},Ge.getTransfer(p)==="srgb"&&(u.defines.SRGB_TRANSFER="");const _=Th[M];_&&(u.defines[_]=""),u.needsUpdate=!0}u.uniforms.tDiffuse.value=b.texture,x.setRenderTarget(d),x.render(f,h),d=null,y=!1},this.isCompositing=function(){return y},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),c!==null&&c.dispose(),l.dispose(),u.dispose()}}var vo=new Gt,Qr=new Si(1,1),Mo=new Ha,So=new Zl,xo=new eo,aa=[],oa=[],la=new Float32Array(16),ca=new Float32Array(9),ha=new Float32Array(4);function ni(e,t,n){const i=e[0];if(i<=0||i>0)return e;const r=t*n;let s=aa[r];if(s===void 0&&(s=new Float32Array(r),aa[r]=s),t!==0){i.toArray(s,0);for(let a=1,o=0;a!==t;++a)o+=n,e[a].toArray(s,o)}return s}function ft(e,t){if(e.length!==t.length)return!1;for(let n=0,i=e.length;n<i;n++)if(e[n]!==t[n])return!1;return!0}function pt(e,t){for(let n=0,i=t.length;n<i;n++)e[n]=t[n]}function dr(e,t){let n=oa[t];n===void 0&&(n=new Int32Array(t),oa[t]=n);for(let i=0;i!==t;++i)n[i]=e.allocateTextureUnit();return n}function Ah(e,t){const n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function wh(e,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(ft(n,t))return;e.uniform2fv(this.addr,t),pt(n,t)}}function Rh(e,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(ft(n,t))return;e.uniform3fv(this.addr,t),pt(n,t)}}function Ch(e,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(ft(n,t))return;e.uniform4fv(this.addr,t),pt(n,t)}}function Ph(e,t){const n=this.cache,i=t.elements;if(i===void 0){if(ft(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),pt(n,t)}else{if(ft(n,i))return;ha.set(i),e.uniformMatrix2fv(this.addr,!1,ha),pt(n,i)}}function Lh(e,t){const n=this.cache,i=t.elements;if(i===void 0){if(ft(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),pt(n,t)}else{if(ft(n,i))return;ca.set(i),e.uniformMatrix3fv(this.addr,!1,ca),pt(n,i)}}function Ih(e,t){const n=this.cache,i=t.elements;if(i===void 0){if(ft(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),pt(n,t)}else{if(ft(n,i))return;la.set(i),e.uniformMatrix4fv(this.addr,!1,la),pt(n,i)}}function Dh(e,t){const n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function Uh(e,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(ft(n,t))return;e.uniform2iv(this.addr,t),pt(n,t)}}function Nh(e,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(ft(n,t))return;e.uniform3iv(this.addr,t),pt(n,t)}}function Oh(e,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(ft(n,t))return;e.uniform4iv(this.addr,t),pt(n,t)}}function Fh(e,t){const n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function Bh(e,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(ft(n,t))return;e.uniform2uiv(this.addr,t),pt(n,t)}}function zh(e,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(ft(n,t))return;e.uniform3uiv(this.addr,t),pt(n,t)}}function Vh(e,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(ft(n,t))return;e.uniform4uiv(this.addr,t),pt(n,t)}}function Gh(e,t,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(e.uniform1i(this.addr,r),i[0]=r);let s;this.type===e.SAMPLER_2D_SHADOW?(Qr.compareFunction=n.isReversedDepthBuffer()?518:515,s=Qr):s=vo,n.setTexture2D(t||s,r)}function Hh(e,t,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(e.uniform1i(this.addr,r),i[0]=r),n.setTexture3D(t||So,r)}function kh(e,t,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(e.uniform1i(this.addr,r),i[0]=r),n.setTextureCube(t||xo,r)}function Wh(e,t,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(e.uniform1i(this.addr,r),i[0]=r),n.setTexture2DArray(t||Mo,r)}function Xh(e){switch(e){case 5126:return Ah;case 35664:return wh;case 35665:return Rh;case 35666:return Ch;case 35674:return Ph;case 35675:return Lh;case 35676:return Ih;case 5124:case 35670:return Dh;case 35667:case 35671:return Uh;case 35668:case 35672:return Nh;case 35669:case 35673:return Oh;case 5125:return Fh;case 36294:return Bh;case 36295:return zh;case 36296:return Vh;case 35678:case 36198:case 36298:case 36306:case 35682:return Gh;case 35679:case 36299:case 36307:return Hh;case 35680:case 36300:case 36308:case 36293:return kh;case 36289:case 36303:case 36311:case 36292:return Wh}}function qh(e,t){e.uniform1fv(this.addr,t)}function Yh(e,t){const n=ni(t,this.size,2);e.uniform2fv(this.addr,n)}function Kh(e,t){const n=ni(t,this.size,3);e.uniform3fv(this.addr,n)}function Zh(e,t){const n=ni(t,this.size,4);e.uniform4fv(this.addr,n)}function Jh(e,t){const n=ni(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function $h(e,t){const n=ni(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function Qh(e,t){const n=ni(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function jh(e,t){e.uniform1iv(this.addr,t)}function eu(e,t){e.uniform2iv(this.addr,t)}function tu(e,t){e.uniform3iv(this.addr,t)}function nu(e,t){e.uniform4iv(this.addr,t)}function iu(e,t){e.uniform1uiv(this.addr,t)}function ru(e,t){e.uniform2uiv(this.addr,t)}function su(e,t){e.uniform3uiv(this.addr,t)}function au(e,t){e.uniform4uiv(this.addr,t)}function ou(e,t,n){const i=this.cache,r=t.length,s=dr(n,r);ft(i,s)||(e.uniform1iv(this.addr,s),pt(i,s));let a;this.type===e.SAMPLER_2D_SHADOW?a=Qr:a=vo;for(let o=0;o!==r;++o)n.setTexture2D(t[o]||a,s[o])}function lu(e,t,n){const i=this.cache,r=t.length,s=dr(n,r);ft(i,s)||(e.uniform1iv(this.addr,s),pt(i,s));for(let a=0;a!==r;++a)n.setTexture3D(t[a]||So,s[a])}function cu(e,t,n){const i=this.cache,r=t.length,s=dr(n,r);ft(i,s)||(e.uniform1iv(this.addr,s),pt(i,s));for(let a=0;a!==r;++a)n.setTextureCube(t[a]||xo,s[a])}function hu(e,t,n){const i=this.cache,r=t.length,s=dr(n,r);ft(i,s)||(e.uniform1iv(this.addr,s),pt(i,s));for(let a=0;a!==r;++a)n.setTexture2DArray(t[a]||Mo,s[a])}function uu(e){switch(e){case 5126:return qh;case 35664:return Yh;case 35665:return Kh;case 35666:return Zh;case 35674:return Jh;case 35675:return $h;case 35676:return Qh;case 5124:case 35670:return jh;case 35667:case 35671:return eu;case 35668:case 35672:return tu;case 35669:case 35673:return nu;case 5125:return iu;case 36294:return ru;case 36295:return su;case 36296:return au;case 35678:case 36198:case 36298:case 36306:case 35682:return ou;case 35679:case 36299:case 36307:return lu;case 35680:case 36300:case 36308:case 36293:return cu;case 36289:case 36303:case 36311:case 36292:return hu}}var du=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Xh(t.type)}},fu=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=uu(t.type)}},pu=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const i=this.seq;for(let r=0,s=i.length;r!==s;++r){const a=i[r];a.setValue(e,t[a.id],n)}}},Wr=/(\w+)(\])?(\[|\.)?/g;function ua(e,t){e.seq.push(t),e.map[t.id]=t}function mu(e,t,n){const i=e.name,r=i.length;for(Wr.lastIndex=0;;){const s=Wr.exec(i),a=Wr.lastIndex;let o=s[1];const c=s[2]==="]",l=s[3];if(c&&(o=o|0),l===void 0||l==="["&&a+2===r){ua(n,l===void 0?new du(o,e,t):new fu(o,e,t));break}else{let u=n.map[o];u===void 0&&(u=new pu(o),ua(n,u)),n=u}}}var nr=class{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){const a=e.getActiveUniform(t,s);mu(a,e.getUniformLocation(t,a.name),this)}const i=[],r=[];for(const s of this.seq)s.type===e.SAMPLER_2D_SHADOW||s.type===e.SAMPLER_CUBE_SHADOW||s.type===e.SAMPLER_2D_ARRAY_SHADOW?i.push(s):r.push(s);i.length>0&&(this.seq=i.concat(r))}setValue(e,t,n,i){const r=this.map[t];r!==void 0&&r.setValue(e,n,i)}setOptional(e,t,n){const i=t[n];i!==void 0&&this.setValue(e,n,i)}static upload(e,t,n,i){for(let r=0,s=t.length;r!==s;++r){const a=t[r],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,i)}}static seqWithValue(e,t){const n=[];for(let i=0,r=e.length;i!==r;++i){const s=e[i];s.id in t&&n.push(s)}return n}};function da(e,t,n){const i=e.createShader(t);return e.shaderSource(i,n),e.compileShader(i),i}var gu=37297,_u=0;function vu(e,t){const n=e.split(`
`),i=[],r=Math.max(t-6,0),s=Math.min(t+6,n.length);for(let a=r;a<s;a++){const o=a+1;i.push(`${o===t?">":" "} ${o}: ${n[a]}`)}return i.join(`
`)}var fa=new Ie;function Mu(e){Ge._getMatrix(fa,Ge.workingColorSpace,e);const t=`mat3( ${fa.elements.map(n=>n.toFixed(4))} )`;switch(Ge.getTransfer(e)){case sr:return[t,"LinearTransferOETF"];case ar:return[t,"sRGBTransferOETF"];default:return be("WebGLProgram: Unsupported color space: ",e),[t,"LinearTransferOETF"]}}function pa(e,t,n){const i=e.getShaderParameter(t,e.COMPILE_STATUS),r=(e.getShaderInfoLog(t)||"").trim();if(i&&r==="")return"";const s=/ERROR: 0:(\d+)/.exec(r);if(s){const a=parseInt(s[1]);return n.toUpperCase()+`

`+r+`

`+vu(e.getShaderSource(t),a)}else return r}function Su(e,t){const n=Mu(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,"}"].join(`
`)}var xu={1:"Linear",2:"Reinhard",3:"Cineon",4:"ACESFilmic",6:"AgX",7:"Neutral",5:"Custom"};function yu(e,t){const n=xu[t];return n===void 0?(be("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+e+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+e+"( vec3 color ) { return "+n+"ToneMapping( color ); }"}var ji=new B;function Eu(){return Ge.getLuminanceCoefficients(ji),["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${ji.x.toFixed(4)}, ${ji.y.toFixed(4)}, ${ji.z.toFixed(4)} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Tu(e){return[e.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",e.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(pi).join(`
`)}function bu(e){const t=[];for(const n in e){const i=e[n];i!==!1&&t.push("#define "+n+" "+i)}return t.join(`
`)}function Au(e,t){const n={},i=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let r=0;r<i;r++){const s=e.getActiveAttrib(t,r),a=s.name;let o=1;s.type===e.FLOAT_MAT2&&(o=2),s.type===e.FLOAT_MAT3&&(o=3),s.type===e.FLOAT_MAT4&&(o=4),n[a]={type:s.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function pi(e){return e!==""}function ma(e,t){const n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function ga(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var wu=/^[ \t]*#include +<([\w\d./]+)>/gm;function jr(e){return e.replace(wu,Cu)}var Ru=new Map;function Cu(e,t){let n=Oe[t];if(n===void 0){const i=Ru.get(t);if(i!==void 0)n=Oe[i],be('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return jr(n)}var Pu=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function _a(e){return e.replace(Pu,Lu)}function Lu(e,t,n,i){let r="";for(let s=parseInt(t);s<parseInt(n);s++)r+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function va(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision==="highp"?t+=`
#define HIGH_PRECISION`:e.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:e.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}var Iu={1:"SHADOWMAP_TYPE_PCF",3:"SHADOWMAP_TYPE_VSM"};function Du(e){return Iu[e.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var Uu={301:"ENVMAP_TYPE_CUBE",302:"ENVMAP_TYPE_CUBE",306:"ENVMAP_TYPE_CUBE_UV"};function Nu(e){return e.envMap===!1?"ENVMAP_TYPE_CUBE":Uu[e.envMapMode]||"ENVMAP_TYPE_CUBE"}var Ou={302:"ENVMAP_MODE_REFRACTION"};function Fu(e){return e.envMap===!1?"ENVMAP_MODE_REFLECTION":Ou[e.envMapMode]||"ENVMAP_MODE_REFLECTION"}var Bu={0:"ENVMAP_BLENDING_MULTIPLY",1:"ENVMAP_BLENDING_MIX",2:"ENVMAP_BLENDING_ADD"};function zu(e){return e.envMap===!1?"ENVMAP_BLENDING_NONE":Bu[e.combine]||"ENVMAP_BLENDING_NONE"}function Vu(e){const t=e.envMapCubeUVHeight;if(t===null)return null;const n=Math.log2(t)-2,i=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,n),112)),texelHeight:i,maxMip:n}}function Gu(e,t,n,i){const r=e.getContext(),s=n.defines;let a=n.vertexShader,o=n.fragmentShader;const c=Du(n),l=Nu(n),u=Fu(n),f=zu(n),h=Vu(n),p=Tu(n),M=bu(s),y=r.createProgram();let g,d,A=n.glslVersion?"#version "+n.glslVersion+`
`:"";n.isRawShaderMaterial?(g=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,M].filter(pi).join(`
`),g.length>0&&(g+=`
`),d=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,M].filter(pi).join(`
`),d.length>0&&(d+=`
`)):(g=[va(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,M,n.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",n.batching?"#define USE_BATCHING":"",n.batchingColor?"#define USE_BATCHING_COLOR":"",n.instancing?"#define USE_INSTANCING":"",n.instancingColor?"#define USE_INSTANCING_COLOR":"",n.instancingMorph?"#define USE_INSTANCING_MORPH":"",n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.map?"#define USE_MAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+u:"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.displacementMap?"#define USE_DISPLACEMENTMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.mapUv?"#define MAP_UV "+n.mapUv:"",n.alphaMapUv?"#define ALPHAMAP_UV "+n.alphaMapUv:"",n.lightMapUv?"#define LIGHTMAP_UV "+n.lightMapUv:"",n.aoMapUv?"#define AOMAP_UV "+n.aoMapUv:"",n.emissiveMapUv?"#define EMISSIVEMAP_UV "+n.emissiveMapUv:"",n.bumpMapUv?"#define BUMPMAP_UV "+n.bumpMapUv:"",n.normalMapUv?"#define NORMALMAP_UV "+n.normalMapUv:"",n.displacementMapUv?"#define DISPLACEMENTMAP_UV "+n.displacementMapUv:"",n.metalnessMapUv?"#define METALNESSMAP_UV "+n.metalnessMapUv:"",n.roughnessMapUv?"#define ROUGHNESSMAP_UV "+n.roughnessMapUv:"",n.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+n.anisotropyMapUv:"",n.clearcoatMapUv?"#define CLEARCOATMAP_UV "+n.clearcoatMapUv:"",n.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+n.clearcoatNormalMapUv:"",n.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+n.clearcoatRoughnessMapUv:"",n.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+n.iridescenceMapUv:"",n.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+n.iridescenceThicknessMapUv:"",n.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+n.sheenColorMapUv:"",n.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+n.sheenRoughnessMapUv:"",n.specularMapUv?"#define SPECULARMAP_UV "+n.specularMapUv:"",n.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+n.specularColorMapUv:"",n.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+n.specularIntensityMapUv:"",n.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+n.transmissionMapUv:"",n.thicknessMapUv?"#define THICKNESSMAP_UV "+n.thicknessMapUv:"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexNormals?"#define HAS_NORMAL":"",n.vertexColors?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.flatShading?"#define FLAT_SHADED":"",n.skinning?"#define USE_SKINNING":"",n.morphTargets?"#define USE_MORPHTARGETS":"",n.morphNormals&&n.flatShading===!1?"#define USE_MORPHNORMALS":"",n.morphColors?"#define USE_MORPHCOLORS":"",n.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+n.morphTextureStride:"",n.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+n.morphTargetsCount:"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+c:"",n.sizeAttenuation?"#define USE_SIZEATTENUATION":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",n.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(pi).join(`
`),d=[va(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,M,n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",n.map?"#define USE_MAP":"",n.matcap?"#define USE_MATCAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+l:"",n.envMap?"#define "+u:"",n.envMap?"#define "+f:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoat?"#define USE_CLEARCOAT":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.dispersion?"#define USE_DISPERSION":"",n.retroreflection?"#define USE_RETROREFLECTION":"",n.iridescence?"#define USE_IRIDESCENCE":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaTest?"#define USE_ALPHATEST":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.sheen?"#define USE_SHEEN":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors||n.instancingColor?"#define USE_COLOR":"",n.vertexAlphas||n.batchingColor?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.gradientMap?"#define USE_GRADIENTMAP":"",n.flatShading?"#define FLAT_SHADED":"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+c:"",n.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",n.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",n.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",n.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",n.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",n.toneMapping!==0?"#define TONE_MAPPING":"",n.toneMapping!==0?Oe.tonemapping_pars_fragment:"",n.toneMapping!==0?yu("toneMapping",n.toneMapping):"",n.dithering?"#define DITHERING":"",n.opaque?"#define OPAQUE":"",Oe.colorspace_pars_fragment,Su("linearToOutputTexel",n.outputColorSpace),Eu(),n.useDepthPacking?"#define DEPTH_PACKING "+n.depthPacking:"",`
`].filter(pi).join(`
`)),a=jr(a),a=ma(a,n),a=ga(a,n),o=jr(o),o=ma(o,n),o=ga(o,n),a=_a(a),o=_a(o),n.isRawShaderMaterial!==!0&&(A=`#version 300 es
`,g=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,d=["#define varying in",n.glslVersion==="300 es"?"":"layout(location = 0) out highp vec4 pc_fragColor;",n.glslVersion==="300 es"?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);const I=A+g+a,x=A+d+o,T=da(r,r.VERTEX_SHADER,I),b=da(r,r.FRAGMENT_SHADER,x);r.attachShader(y,T),r.attachShader(y,b),n.index0AttributeName!==void 0?r.bindAttribLocation(y,0,n.index0AttributeName):n.hasPositionAttribute===!0&&r.bindAttribLocation(y,0,"position"),r.linkProgram(y);function w(U){if(e.debug.checkShaderErrors){const O=r.getProgramInfoLog(y)||"",Y=r.getShaderInfoLog(T)||"",D=r.getShaderInfoLog(b)||"",V=O.trim(),J=Y.trim(),H=D.trim();let oe=!0,X=!0;if(r.getProgramParameter(y,r.LINK_STATUS)===!1)if(oe=!1,typeof e.debug.onShaderError=="function")e.debug.onShaderError(r,y,T,b);else{const K=pa(r,T,"vertex"),$=pa(r,b,"fragment");Ce("WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(y,r.VALIDATE_STATUS)+`

Material Name: `+U.name+`
Material Type: `+U.type+`

Program Info Log: `+V+`
`+K+`
`+$)}else V!==""?be("WebGLProgram: Program Info Log:",V):(J===""||H==="")&&(X=!1);X&&(U.diagnostics={runnable:oe,programLog:V,vertexShader:{log:J,prefix:g},fragmentShader:{log:H,prefix:d}})}r.deleteShader(T),r.deleteShader(b),_=new nr(r,y),E=Au(r,y)}let _;this.getUniforms=function(){return _===void 0&&w(this),_};let E;this.getAttributes=function(){return E===void 0&&w(this),E};let G=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return G===!1&&(G=r.getProgramParameter(y,gu)),G},this.destroy=function(){i.releaseStatesOfProgram(this),r.deleteProgram(y),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=_u++,this.cacheKey=t,this.usedTimes=1,this.program=y,this.vertexShader=T,this.fragmentShader=b,this}var Hu=0,ku=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){const i=this._getShaderCacheForMaterial(e);return i.has(t)===!1&&(i.add(t),t.usedTimes++),i.has(n)===!1&&(i.add(n),n.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new Wu(e),t.set(e,n)),n}},Wu=class{constructor(e){this.id=Hu++,this.code=e,this.usedTimes=0}};function Xu(e){return e===1030||e===37490||e===36285}function qu(e,t,n,i,r,s){const a=new Xa,o=new ku,c=new Set,l=[],u=new Map,f=i.logarithmicDepthBuffer;let h=i.precision;const p={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function M(_){return c.add(_),_===0?"uv":`uv${_}`}function y(_,E,G,U,O,Y){const D=U.fog,V=O.geometry,J=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?U.environment:null,H=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,oe=t.get(_.envMap||J,H),X=oe&&oe.mapping===306?oe.image.height:null,K=p[_.type];_.precision!==null&&(h=i.getMaxPrecision(_.precision),h!==_.precision&&be("WebGLProgram.getParameters:",_.precision,"not supported, using",h,"instead."));const $=V.morphAttributes.position||V.morphAttributes.normal||V.morphAttributes.color,Ne=$!==void 0?$.length:0;let ye=0;V.morphAttributes.position!==void 0&&(ye=1),V.morphAttributes.normal!==void 0&&(ye=2),V.morphAttributes.color!==void 0&&(ye=3);let je,Ue,q,ne;if(K){const dt=qt[K];je=dt.vertexShader,Ue=dt.fragmentShader}else{je=_.vertexShader,Ue=_.fragmentShader;const dt=o.getVertexShaderStage(_),Ye=o.getFragmentShaderStage(_);o.update(_,dt,Ye),q=dt.id,ne=Ye.id}const ae=e.getRenderTarget(),Te=e.state.buffers.depth.getReversed(),Re=O.isInstancedMesh===!0,de=O.isBatchedMesh===!0,Ke=!!_.map,Xe=!!_.matcap,Le=!!oe,at=!!_.aoMap,St=!!_.lightMap,wt=!!_.bumpMap&&_.wireframe===!1,et=!!_.normalMap,bt=!!_.displacementMap,ht=!!_.emissiveMap,ut=!!_.metalnessMap,P=!!_.roughnessMap,At=_.anisotropy>0,qe=_.clearcoat>0,nt=_.dispersion>0,S=_.retroreflectivity>0,m=_.iridescence>0,R=_.sheen>0,k=_.transmission>0,Q=At&&!!_.anisotropyMap,re=qe&&!!_.clearcoatMap,le=qe&&!!_.clearcoatNormalMap,N=qe&&!!_.clearcoatRoughnessMap,ie=m&&!!_.iridescenceMap,pe=m&&!!_.iridescenceThicknessMap,ve=R&&!!_.sheenColorMap,te=R&&!!_.sheenRoughnessMap,_e=!!_.specularMap,Ee=!!_.specularColorMap,Pe=!!_.specularIntensityMap,He=k&&!!_.transmissionMap,L=k&&!!_.thicknessMap,Z=!!_.gradientMap,j=!!_.alphaMap,fe=_.alphaTest>0,Me=!!_.alphaHash,ee=!!_.extensions;let ue=0;_.toneMapped&&(ae===null||ae.isXRRenderTarget===!0)&&(ue=e.toneMapping);const we={shaderID:K,shaderType:_.type,shaderName:_.name,vertexShader:je,fragmentShader:Ue,defines:_.defines,customVertexShaderID:q,customFragmentShaderID:ne,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:h,batching:de,batchingColor:de&&O._colorsTexture!==null,instancing:Re,instancingColor:Re&&O.instanceColor!==null,instancingMorph:Re&&O.morphTexture!==null,outputColorSpace:ae===null?e.outputColorSpace:ae.isXRRenderTarget===!0?ae.texture.colorSpace:Ge.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:Ke,matcap:Xe,envMap:Le,envMapMode:Le&&oe.mapping,envMapCubeUVHeight:X,aoMap:at,lightMap:St,bumpMap:wt,normalMap:et,displacementMap:bt,emissiveMap:ht,normalMapObjectSpace:et&&_.normalMapType===1,normalMapTangentSpace:et&&_.normalMapType===0,packedNormalMap:et&&_.normalMapType===0&&Xu(_.normalMap.format),metalnessMap:ut,roughnessMap:P,anisotropy:At,anisotropyMap:Q,clearcoat:qe,clearcoatMap:re,clearcoatNormalMap:le,clearcoatRoughnessMap:N,dispersion:nt,retroreflection:S,iridescence:m,iridescenceMap:ie,iridescenceThicknessMap:pe,sheen:R,sheenColorMap:ve,sheenRoughnessMap:te,specularMap:_e,specularColorMap:Ee,specularIntensityMap:Pe,transmission:k,transmissionMap:He,thicknessMap:L,gradientMap:Z,opaque:_.transparent===!1&&_.blending===1&&_.alphaToCoverage===!1,alphaMap:j,alphaTest:fe,alphaHash:Me,combine:_.combine,mapUv:Ke&&M(_.map.channel),aoMapUv:at&&M(_.aoMap.channel),lightMapUv:St&&M(_.lightMap.channel),bumpMapUv:wt&&M(_.bumpMap.channel),normalMapUv:et&&M(_.normalMap.channel),displacementMapUv:bt&&M(_.displacementMap.channel),emissiveMapUv:ht&&M(_.emissiveMap.channel),metalnessMapUv:ut&&M(_.metalnessMap.channel),roughnessMapUv:P&&M(_.roughnessMap.channel),anisotropyMapUv:Q&&M(_.anisotropyMap.channel),clearcoatMapUv:re&&M(_.clearcoatMap.channel),clearcoatNormalMapUv:le&&M(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:N&&M(_.clearcoatRoughnessMap.channel),iridescenceMapUv:ie&&M(_.iridescenceMap.channel),iridescenceThicknessMapUv:pe&&M(_.iridescenceThicknessMap.channel),sheenColorMapUv:ve&&M(_.sheenColorMap.channel),sheenRoughnessMapUv:te&&M(_.sheenRoughnessMap.channel),specularMapUv:_e&&M(_.specularMap.channel),specularColorMapUv:Ee&&M(_.specularColorMap.channel),specularIntensityMapUv:Pe&&M(_.specularIntensityMap.channel),transmissionMapUv:He&&M(_.transmissionMap.channel),thicknessMapUv:L&&M(_.thicknessMap.channel),alphaMapUv:j&&M(_.alphaMap.channel),vertexTangents:!!V.attributes.tangent&&(et||At),vertexNormals:!!V.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!V.attributes.color&&V.attributes.color.itemSize===4,pointsUvs:O.isPoints===!0&&!!V.attributes.uv&&(Ke||j),fog:!!D,useFog:_.fog===!0,fogExp2:!!D&&D.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||V.attributes.normal===void 0&&et===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:f,reversedDepthBuffer:Te,skinning:O.isSkinnedMesh===!0,hasPositionAttribute:V.attributes.position!==void 0,morphTargets:V.morphAttributes.position!==void 0,morphNormals:V.morphAttributes.normal!==void 0,morphColors:V.morphAttributes.color!==void 0,morphTargetsCount:Ne,morphTextureStride:ye,numSunLights:E.sun.length,numDirLights:E.directional.length,numPointLights:E.point.length,numSpotLights:E.spot.length,numSpotLightMaps:E.spotLightMap.length,numRectAreaLights:E.rectArea.length,numHemiLights:E.hemi.length,numSunLightShadows:E.sunShadowMap.length,numDirLightShadows:E.directionalShadowMap.length,numPointLightShadows:E.pointShadowMap.length,numSpotLightShadows:E.spotShadowMap.length,numSpotLightShadowsWithMaps:E.numSpotLightShadowsWithMaps,numLightProbes:E.numLightProbes,numLightProbeGrids:Y.length,numClippingPlanes:s.numPlanes,numClipIntersection:s.numIntersection,dithering:_.dithering,shadowMapEnabled:e.shadowMap.enabled&&G.length>0,shadowMapType:e.shadowMap.type,toneMapping:ue,decodeVideoTexture:Ke&&_.map.isVideoTexture===!0&&Ge.getTransfer(_.map.colorSpace)==="srgb",decodeVideoTextureEmissive:ht&&_.emissiveMap.isVideoTexture===!0&&Ge.getTransfer(_.emissiveMap.colorSpace)==="srgb",premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===2,flipSided:_.side===1,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:ee&&_.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ee&&_.extensions.multiDraw===!0||de)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return we.vertexUv1s=c.has(1),we.vertexUv2s=c.has(2),we.vertexUv3s=c.has(3),c.clear(),we}function g(_){const E=[];if(_.shaderID?E.push(_.shaderID):(E.push(_.customVertexShaderID),E.push(_.customFragmentShaderID)),_.defines!==void 0)for(const G in _.defines)E.push(G),E.push(_.defines[G]);return _.isRawShaderMaterial===!1&&(d(E,_),A(E,_),E.push(e.outputColorSpace)),E.push(_.customProgramCacheKey),E.join()}function d(_,E){_.push(E.precision),_.push(E.outputColorSpace),_.push(E.envMapMode),_.push(E.envMapCubeUVHeight),_.push(E.mapUv),_.push(E.alphaMapUv),_.push(E.lightMapUv),_.push(E.aoMapUv),_.push(E.bumpMapUv),_.push(E.normalMapUv),_.push(E.displacementMapUv),_.push(E.emissiveMapUv),_.push(E.metalnessMapUv),_.push(E.roughnessMapUv),_.push(E.anisotropyMapUv),_.push(E.clearcoatMapUv),_.push(E.clearcoatNormalMapUv),_.push(E.clearcoatRoughnessMapUv),_.push(E.iridescenceMapUv),_.push(E.iridescenceThicknessMapUv),_.push(E.sheenColorMapUv),_.push(E.sheenRoughnessMapUv),_.push(E.specularMapUv),_.push(E.specularColorMapUv),_.push(E.specularIntensityMapUv),_.push(E.transmissionMapUv),_.push(E.thicknessMapUv),_.push(E.combine),_.push(E.fogExp2),_.push(E.sizeAttenuation),_.push(E.morphTargetsCount),_.push(E.morphAttributeCount),_.push(E.numSunLights),_.push(E.numDirLights),_.push(E.numPointLights),_.push(E.numSpotLights),_.push(E.numSpotLightMaps),_.push(E.numHemiLights),_.push(E.numRectAreaLights),_.push(E.numSunLightShadows),_.push(E.numDirLightShadows),_.push(E.numPointLightShadows),_.push(E.numSpotLightShadows),_.push(E.numSpotLightShadowsWithMaps),_.push(E.numLightProbes),_.push(E.shadowMapType),_.push(E.toneMapping),_.push(E.numClippingPlanes),_.push(E.numClipIntersection),_.push(E.depthPacking)}function A(_,E){a.disableAll(),E.instancing&&a.enable(0),E.instancingColor&&a.enable(1),E.instancingMorph&&a.enable(2),E.matcap&&a.enable(3),E.envMap&&a.enable(4),E.normalMapObjectSpace&&a.enable(5),E.normalMapTangentSpace&&a.enable(6),E.clearcoat&&a.enable(7),E.iridescence&&a.enable(8),E.alphaTest&&a.enable(9),E.vertexColors&&a.enable(10),E.vertexAlphas&&a.enable(11),E.vertexUv1s&&a.enable(12),E.vertexUv2s&&a.enable(13),E.vertexUv3s&&a.enable(14),E.vertexTangents&&a.enable(15),E.anisotropy&&a.enable(16),E.alphaHash&&a.enable(17),E.batching&&a.enable(18),E.dispersion&&a.enable(19),E.retroreflection&&a.enable(24),E.batchingColor&&a.enable(20),E.gradientMap&&a.enable(21),E.packedNormalMap&&a.enable(22),E.vertexNormals&&a.enable(23),_.push(a.mask),a.disableAll(),E.fog&&a.enable(0),E.useFog&&a.enable(1),E.flatShading&&a.enable(2),E.logarithmicDepthBuffer&&a.enable(3),E.reversedDepthBuffer&&a.enable(4),E.skinning&&a.enable(5),E.morphTargets&&a.enable(6),E.morphNormals&&a.enable(7),E.morphColors&&a.enable(8),E.premultipliedAlpha&&a.enable(9),E.shadowMapEnabled&&a.enable(10),E.doubleSided&&a.enable(11),E.flipSided&&a.enable(12),E.useDepthPacking&&a.enable(13),E.dithering&&a.enable(14),E.transmission&&a.enable(15),E.sheen&&a.enable(16),E.opaque&&a.enable(17),E.pointsUvs&&a.enable(18),E.decodeVideoTexture&&a.enable(19),E.decodeVideoTextureEmissive&&a.enable(20),E.alphaToCoverage&&a.enable(21),E.numLightProbeGrids>0&&a.enable(22),E.hasPositionAttribute&&a.enable(23),_.push(a.mask)}function I(_){const E=p[_.type];let G;if(E){const U=qt[E];G=Sc.clone(U.uniforms)}else G=_.uniforms;return G}function x(_,E){let G=u.get(E);return G!==void 0?++G.usedTimes:(G=new Gu(e,E,_,r),l.push(G),u.set(E,G)),G}function T(_){if(--_.usedTimes===0){const E=l.indexOf(_);l[E]=l[l.length-1],l.pop(),u.delete(_.cacheKey),_.destroy()}}function b(_){o.remove(_)}function w(){o.dispose()}return{getParameters:y,getProgramCacheKey:g,getUniforms:I,acquireProgram:x,releaseProgram:T,releaseShaderCache:b,programs:l,dispose:w}}function Yu(){let e=new WeakMap;function t(a){return e.has(a)}function n(a){let o=e.get(a);return o===void 0&&(o={},e.set(a,o)),o}function i(a){e.delete(a)}function r(a,o,c){e.get(a)[o]=c}function s(){e=new WeakMap}return{has:t,get:n,remove:i,update:r,dispose:s}}function Ku(e,t){return e.groupOrder!==t.groupOrder?e.groupOrder-t.groupOrder:e.renderOrder!==t.renderOrder?e.renderOrder-t.renderOrder:e.material.id!==t.material.id?e.material.id-t.material.id:e.materialVariant!==t.materialVariant?e.materialVariant-t.materialVariant:e.z!==t.z?e.z-t.z:e.id-t.id}function Ma(e,t){return e.groupOrder!==t.groupOrder?e.groupOrder-t.groupOrder:e.renderOrder!==t.renderOrder?e.renderOrder-t.renderOrder:e.z!==t.z?t.z-e.z:e.id-t.id}function Sa(){const e=[];let t=0;const n=[],i=[],r=[];function s(){t=0,n.length=0,i.length=0,r.length=0}function a(h){let p=0;return h.isInstancedMesh&&(p+=2),h.isSkinnedMesh&&(p+=1),p}function o(h,p,M,y,g,d){let A=e[t];return A===void 0?(A={id:h.id,object:h,geometry:p,material:M,materialVariant:a(h),groupOrder:y,renderOrder:h.renderOrder,z:g,group:d},e[t]=A):(A.id=h.id,A.object=h,A.geometry=p,A.material=M,A.materialVariant=a(h),A.groupOrder=y,A.renderOrder=h.renderOrder,A.z=g,A.group=d),t++,A}function c(h,p,M,y,g,d,A){A.reversedDepth===!0&&(g=-g);const I=o(h,p,M,y,g,d);M.transmission>0?i.push(I):M.transparent===!0?r.push(I):n.push(I)}function l(h,p,M,y,g,d){const A=o(h,p,M,y,g,d);M.transmission>0?i.unshift(A):M.transparent===!0?r.unshift(A):n.unshift(A)}function u(h,p){n.length>1&&n.sort(h||Ku),i.length>1&&i.sort(p||Ma),r.length>1&&r.sort(p||Ma)}function f(){for(let h=t,p=e.length;h<p;h++){const M=e[h];if(M.id===null)break;M.id=null,M.object=null,M.geometry=null,M.material=null,M.group=null}}return{opaque:n,transmissive:i,transparent:r,init:s,push:c,unshift:l,finish:f,sort:u}}function Zu(){let e=new WeakMap;function t(i,r){const s=e.get(i);let a;return s===void 0?(a=new Sa,e.set(i,[a])):r>=s.length?(a=new Sa,s.push(a)):a=s[r],a}function n(){e=new WeakMap}return{get:t,dispose:n}}function Ju(){const e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case"SunLight":case"DirectionalLight":n={direction:new B,color:new De};break;case"SpotLight":n={position:new B,direction:new B,color:new De,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":n={position:new B,color:new De,distance:0,decay:0};break;case"HemisphereLight":n={direction:new B,skyColor:new De,groundColor:new De};break;case"RectAreaLight":n={color:new De,position:new B,halfWidth:new B,halfHeight:new B}}return e[t.id]=n,n}}}function $u(){const e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case"SunLight":case"DirectionalLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ze};break;case"SpotLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ze};break;case"PointLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ze,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var Qu=0;function ju(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+(t.map?1:0)-(e.map?1:0)}function ed(e){const t=new Ju,n=$u(),i={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)i.probe.push(new B);const r=new B,s=new Qe,a=new Qe;function o(l){let u=0,f=0,h=0;for(let O=0;O<9;O++)i.probe[O].set(0,0,0);let p=0,M=0,y=0,g=0,d=0,A=0,I=0,x=0,T=0,b=0,w=0,_=0,E=0,G=0;l.sort(ju);for(let O=0,Y=l.length;O<Y;O++){const D=l[O],V=D.color,J=D.intensity,H=D.distance;let oe=null;if(D.shadow&&D.shadow.map&&(D.shadow.map.texture.format===1030?oe=D.shadow.map.texture:oe=D.shadow.map.depthTexture||D.shadow.map.texture),D.isAmbientLight)u+=V.r*J,f+=V.g*J,h+=V.b*J;else if(D.isLightProbe){for(let X=0;X<9;X++)i.probe[X].addScaledVector(D.sh.coefficients[X],J);G++}else if(D.isSunLight){const X=t.get(D);if(X.color.copy(D.color).multiplyScalar(D.intensity),D.castShadow){const K=D.shadow,$=n.get(D);$.shadowIntensity=K.intensity,$.shadowBias=K.bias,$.shadowNormalBias=K.normalBias,$.shadowRadius=K.radius,$.shadowMapSize.copy(K.mapSize).multiply(K.getFrameExtents()),i.sunShadow[M]=$,i.sunShadowMap[M]=oe;const Ne=K.getViewportCount();for(let ye=0;ye<Ne;ye++)i.sunShadowMatrix[y+ye]=K.getMatrix(ye),i.sunShadowCascade[y+ye]=K._cascadeData[ye];y+=Ne,M++}i.sun[p]=X,p++}else if(D.isDirectionalLight){const X=t.get(D);if(X.color.copy(D.color).multiplyScalar(D.intensity),D.castShadow){const K=D.shadow,$=n.get(D);$.shadowIntensity=K.intensity,$.shadowBias=K.bias,$.shadowNormalBias=K.normalBias,$.shadowRadius=K.radius,$.shadowMapSize=K.mapSize,i.directionalShadow[g]=$,i.directionalShadowMap[g]=oe,i.directionalShadowMatrix[g]=D.shadow.matrix,T++}i.directional[g]=X,g++}else if(D.isSpotLight){const X=t.get(D);X.position.setFromMatrixPosition(D.matrixWorld),X.color.copy(V).multiplyScalar(J),X.distance=H,X.coneCos=Math.cos(D.angle),X.penumbraCos=Math.cos(D.angle*(1-D.penumbra)),X.decay=D.decay,i.spot[A]=X;const K=D.shadow;if(D.map&&(i.spotLightMap[_]=D.map,_++,K.updateMatrices(D),D.castShadow&&E++),i.spotLightMatrix[A]=K.matrix,D.castShadow){const $=n.get(D);$.shadowIntensity=K.intensity,$.shadowBias=K.bias,$.shadowNormalBias=K.normalBias,$.shadowRadius=K.radius,$.shadowMapSize=K.mapSize,i.spotShadow[A]=$,i.spotShadowMap[A]=oe,w++}A++}else if(D.isRectAreaLight){const X=t.get(D);X.color.copy(V).multiplyScalar(J),X.halfWidth.set(D.width*.5,0,0),X.halfHeight.set(0,D.height*.5,0),i.rectArea[I]=X,I++}else if(D.isPointLight){const X=t.get(D);if(X.color.copy(D.color).multiplyScalar(D.intensity),X.distance=D.distance,X.decay=D.decay,D.castShadow){const K=D.shadow,$=n.get(D);$.shadowIntensity=K.intensity,$.shadowBias=K.bias,$.shadowNormalBias=K.normalBias,$.shadowRadius=K.radius,$.shadowMapSize=K.mapSize,$.shadowCameraNear=K.camera.near,$.shadowCameraFar=K.camera.far,i.pointShadow[d]=$,i.pointShadowMap[d]=oe,i.pointShadowMatrix[d]=D.shadow.matrix,b++}i.point[d]=X,d++}else if(D.isHemisphereLight){const X=t.get(D);X.skyColor.copy(D.color).multiplyScalar(J),X.groundColor.copy(D.groundColor).multiplyScalar(J),i.hemi[x]=X,x++}}I>0&&(e.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=ce.LTC_FLOAT_1,i.rectAreaLTC2=ce.LTC_FLOAT_2):(i.rectAreaLTC1=ce.LTC_HALF_1,i.rectAreaLTC2=ce.LTC_HALF_2)),i.ambient[0]=u,i.ambient[1]=f,i.ambient[2]=h;const U=i.hash;(U.sunLength!==p||U.directionalLength!==g||U.pointLength!==d||U.spotLength!==A||U.rectAreaLength!==I||U.hemiLength!==x||U.numSunShadows!==M||U.numDirectionalShadows!==T||U.numPointShadows!==b||U.numSpotShadows!==w||U.numSpotMaps!==_||U.numLightProbes!==G)&&(i.sun.length=p,i.directional.length=g,i.spot.length=A,i.rectArea.length=I,i.point.length=d,i.hemi.length=x,i.sunShadow.length=M,i.sunShadowMap.length=M,i.sunShadowMatrix.length=y,i.sunShadowCascade.length=y,i.directionalShadow.length=T,i.directionalShadowMap.length=T,i.directionalShadowMatrix.length=T,i.pointShadow.length=b,i.pointShadowMap.length=b,i.pointShadowMatrix.length=b,i.spotShadow.length=w,i.spotShadowMap.length=w,i.spotLightMatrix.length=w+_-E,i.spotLightMap.length=_,i.numSpotLightShadowsWithMaps=E,i.numLightProbes=G,U.sunLength=p,U.directionalLength=g,U.pointLength=d,U.spotLength=A,U.rectAreaLength=I,U.hemiLength=x,U.numSunShadows=M,U.numDirectionalShadows=T,U.numPointShadows=b,U.numSpotShadows=w,U.numSpotMaps=_,U.numLightProbes=G,i.version=Qu++)}function c(l,u){let f=0,h=0,p=0,M=0,y=0,g=0;const d=u.matrixWorldInverse;for(let A=0,I=l.length;A<I;A++){const x=l[A];if(x.isSunLight){const T=i.sun[f];T.direction.setFromMatrixPosition(x.matrixWorld),T.direction.transformDirection(d),f++}else if(x.isDirectionalLight){const T=i.directional[h];T.direction.setFromMatrixPosition(x.matrixWorld),r.setFromMatrixPosition(x.target.matrixWorld),T.direction.sub(r),T.direction.transformDirection(d),h++}else if(x.isSpotLight){const T=i.spot[M];T.position.setFromMatrixPosition(x.matrixWorld),T.position.applyMatrix4(d),T.direction.setFromMatrixPosition(x.matrixWorld),r.setFromMatrixPosition(x.target.matrixWorld),T.direction.sub(r),T.direction.transformDirection(d),M++}else if(x.isRectAreaLight){const T=i.rectArea[y];T.position.setFromMatrixPosition(x.matrixWorld),T.position.applyMatrix4(d),a.identity(),s.copy(x.matrixWorld),s.premultiply(d),a.extractRotation(s),T.halfWidth.set(x.width*.5,0,0),T.halfHeight.set(0,x.height*.5,0),T.halfWidth.applyMatrix4(a),T.halfHeight.applyMatrix4(a),y++}else if(x.isPointLight){const T=i.point[p];T.position.setFromMatrixPosition(x.matrixWorld),T.position.applyMatrix4(d),p++}else if(x.isHemisphereLight){const T=i.hemi[g];T.direction.setFromMatrixPosition(x.matrixWorld),T.direction.transformDirection(d),g++}}}return{setup:o,setupView:c,state:i}}function xa(e){const t=new ed(e),n=[],i=[],r=[];function s(h){f.camera=h,n.length=0,i.length=0,r.length=0}function a(h){n.push(h)}function o(h){i.push(h)}function c(h){r.push(h)}function l(){t.setup(n)}function u(h){t.setupView(n,h)}const f={lightsArray:n,shadowsArray:i,lightProbeGridArray:r,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:s,state:f,setupLights:l,setupLightsView:u,pushLight:a,pushShadow:o,pushLightProbeGrid:c}}function td(e){let t=new WeakMap;function n(r,s=0){const a=t.get(r);let o;return a===void 0?(o=new xa(e),t.set(r,[o])):s>=a.length?(o=new xa(e),a.push(o)):o=a[s],o}function i(){t=new WeakMap}return{get:n,dispose:i}}var nd=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,id=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,rd=[new B(1,0,0),new B(-1,0,0),new B(0,1,0),new B(0,-1,0),new B(0,0,1),new B(0,0,-1)],sd=[new B(0,-1,0),new B(0,-1,0),new B(0,0,1),new B(0,0,-1),new B(0,-1,0),new B(0,-1,0)],ya=new Qe,fi=new B,Xr=new B;function ad(e,t,n){let i=new rs;const r=new ze,s=new ze,a=new rt,o=new bc,c=new Ac,l={},u=n.maxTextureSize,f={0:1,1:0,2:2},h=new Kt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ze},radius:{value:4}},vertexShader:nd,fragmentShader:id}),p=h.clone();p.defines.HORIZONTAL_PASS=1;const M=new It;M.setAttribute("position",new Yt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const y=new gt(M,h),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let d=this.type;this.render=function(b,w,_){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||b.length===0)return;this.type===2&&(be("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=1);const E=e.getRenderTarget(),G=e.getActiveCubeFace(),U=e.getActiveMipmapLevel(),O=e.state;O.setBlending(0),O.buffers.depth.getReversed()===!0?O.buffers.color.setClear(0,0,0,0):O.buffers.color.setClear(1,1,1,1),O.buffers.depth.setTest(!0),O.setScissorTest(!1);const Y=d!==this.type;Y&&w.traverse(function(D){D.material&&(Array.isArray(D.material)?D.material.forEach(V=>V.needsUpdate=!0):D.material.needsUpdate=!0)});for(let D=0,V=b.length;D<V;D++){const J=b[D],H=J.shadow;if(H===void 0){be("WebGLShadowMap:",J,"has no shadow.");continue}if(H.autoUpdate===!1&&H.needsUpdate===!1)continue;r.copy(H.mapSize);const oe=H.getFrameExtents();r.multiply(oe),s.copy(H.mapSize),(r.x>u||r.y>u)&&(r.x>u&&(s.x=Math.floor(u/oe.x),r.x=s.x*oe.x,H.mapSize.x=s.x),r.y>u&&(s.y=Math.floor(u/oe.y),r.y=s.y*oe.y,H.mapSize.y=s.y));const X=e.state.buffers.depth.getReversed();if(H.camera._reversedDepth=X,H.map===null||Y===!0){if(H.map!==null&&(H.map.depthTexture!==null&&(H.map.depthTexture.dispose(),H.map.depthTexture=null),H.map.dispose()),this.type===3){if(J.isPointLight){be("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}H.map=new Vt(r.x,r.y,{format:ir,type:pn,minFilter:Lt,magFilter:Lt,generateMipmaps:!1}),H.map.texture.name=J.name+".shadowMap",H.map.depthTexture=new Si(r.x,r.y,xi),H.map.depthTexture.name=J.name+".shadowMapDepth",H.map.depthTexture.format=vi,H.map.depthTexture.compareFunction=null,H.map.depthTexture.minFilter=Et,H.map.depthTexture.magFilter=Et}else J.isPointLight?(H.map=new _o(r.x),H.map.depthTexture=new _c(r.x,yn)):(H.map=new Vt(r.x,r.y),H.map.depthTexture=new Si(r.x,r.y,yn)),H.map.depthTexture.name=J.name+".shadowMap",H.map.depthTexture.format=vi,this.type===1?(H.map.depthTexture.compareFunction=X?518:515,H.map.depthTexture.minFilter=Lt,H.map.depthTexture.magFilter=Lt):(H.map.depthTexture.compareFunction=null,H.map.depthTexture.minFilter=Et,H.map.depthTexture.magFilter=Et);H.camera.updateProjectionMatrix()}H.map.isWebGLCubeRenderTarget!==!0&&(H.map.width!==r.x||H.map.height!==r.y)&&H.map.setSize(r.x,r.y);const K=H.map.isWebGLCubeRenderTarget?6:H.getViewportCount();J.isPointLight!==!0&&H.updateMatrices(J,_);for(let $=0;$<K;$++){const Ne=H.getCamera($);if(J.isPointLight){const ye=H.camera,je=H.matrix,Ue=J.distance||ye.far;Ue!==ye.far&&(ye.far=Ue,ye.updateProjectionMatrix()),fi.setFromMatrixPosition(J.matrixWorld),ye.position.copy(fi),Xr.copy(ye.position),Xr.add(rd[$]),ye.up.copy(sd[$]),ye.lookAt(Xr),ye.updateMatrixWorld(),je.makeTranslation(-fi.x,-fi.y,-fi.z),ya.multiplyMatrices(ye.projectionMatrix,ye.matrixWorldInverse),H._frustum.setFromProjectionMatrix(ya,ye.coordinateSystem,ye.reversedDepth)}if(H.map.isWebGLCubeRenderTarget)e.setRenderTarget(H.map,$),e.clear();else{$===0&&(e.setRenderTarget(H.map),e.clear());const ye=H.getViewport($);a.set(s.x*ye.x,s.y*ye.y,s.x*ye.z,s.y*ye.w),O.viewport(a)}i=H.getFrustum($),x(w,_,Ne,J,this.type)}H.isPointLightShadow!==!0&&this.type===3&&A(H,_),H.needsUpdate=!1}d=this.type,g.needsUpdate=!1,e.setRenderTarget(E,G,U)};function A(b,w){const _=t.update(y);h.defines.VSM_SAMPLES!==b.blurSamples&&(h.defines.VSM_SAMPLES=b.blurSamples,p.defines.VSM_SAMPLES=b.blurSamples,h.needsUpdate=!0,p.needsUpdate=!0),b.mapPass===null?b.mapPass=new Vt(r.x,r.y,{format:ir,type:pn}):(b.mapPass.width!==b.map.width||b.mapPass.height!==b.map.height)&&b.mapPass.setSize(b.map.width,b.map.height),h.uniforms.shadow_pass.value=b.map.depthTexture,h.uniforms.resolution.value.set(b.map.width,b.map.height),h.uniforms.radius.value=b.radius,e.setRenderTarget(b.mapPass),e.clear(),e.renderBufferDirect(w,null,_,h,y,null),p.uniforms.shadow_pass.value=b.mapPass.texture,p.uniforms.resolution.value.set(b.map.width,b.map.height),p.uniforms.radius.value=b.radius,e.setRenderTarget(b.map),e.clear(),e.renderBufferDirect(w,null,_,p,y,null)}function I(b,w,_,E){let G=null;const U=_.isPointLight===!0?b.customDistanceMaterial:b.customDepthMaterial;if(U!==void 0)G=U;else if(G=_.isPointLight===!0?c:o,e.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0||w.alphaToCoverage===!0){const O=G.uuid,Y=w.uuid;let D=l[O];D===void 0&&(D={},l[O]=D);let V=D[Y];V===void 0&&(V=G.clone(),D[Y]=V,w.addEventListener("dispose",T)),G=V}if(G.visible=w.visible,G.wireframe=w.wireframe,E===3?G.side=w.shadowSide!==null?w.shadowSide:w.side:G.side=w.shadowSide!==null?w.shadowSide:f[w.side],G.alphaMap=w.alphaMap,G.alphaTest=w.alphaToCoverage===!0?.5:w.alphaTest,G.map=w.map,G.clipShadows=w.clipShadows,G.clippingPlanes=w.clippingPlanes,G.clipIntersection=w.clipIntersection,G.displacementMap=w.displacementMap,G.displacementScale=w.displacementScale,G.displacementBias=w.displacementBias,G.wireframeLinewidth=w.wireframeLinewidth,G.linewidth=w.linewidth,_.isPointLight===!0&&G.isMeshDistanceMaterial===!0){const O=e.properties.get(G);O.light=_}return G}function x(b,w,_,E,G){if(b.visible===!1)return;if(b.layers.test(w.layers)&&(b.isMesh||b.isLine||b.isPoints)&&(b.castShadow||b.receiveShadow&&G===3)&&(!b.frustumCulled||b.intersectsFrustum(i))){b.modelViewMatrix.multiplyMatrices(_.matrixWorldInverse,b.matrixWorld);const O=t.update(b),Y=b.material;if(Array.isArray(Y)){const D=O.groups;for(let V=0,J=D.length;V<J;V++){const H=D[V],oe=Y[H.materialIndex];if(oe&&oe.visible){const X=I(b,oe,E,G);b.onBeforeShadow(e,b,w,_,O,X,H),e.renderBufferDirect(_,null,O,X,b,H),b.onAfterShadow(e,b,w,_,O,X,H)}}}else if(Y.visible){const D=I(b,Y,E,G);b.onBeforeShadow(e,b,w,_,O,D,null),e.renderBufferDirect(_,null,O,D,b,null),b.onAfterShadow(e,b,w,_,O,D,null)}}const U=b.children;for(let O=0,Y=U.length;O<Y;O++)x(U[O],w,_,E,G)}function T(b){b.target.removeEventListener("dispose",T);for(const w in l){const _=l[w],E=b.target.uuid;E in _&&(_[E].dispose(),delete _[E])}}}function od(e,t){function n(){let L=!1;const Z=new rt;let j=null;const fe=new rt(0,0,0,0);return{setMask:function(Me){j!==Me&&!L&&(e.colorMask(Me,Me,Me,Me),j=Me)},setLocked:function(Me){L=Me},setClear:function(Me,ee,ue,we,dt){dt===!0&&(Me*=we,ee*=we,ue*=we),Z.set(Me,ee,ue,we),fe.equals(Z)===!1&&(e.clearColor(Me,ee,ue,we),fe.copy(Z))},reset:function(){L=!1,j=null,fe.set(-1,0,0,0)}}}function i(){let L=!1,Z=!1,j=null,fe=null,Me=null;return{setReversed:function(ee){if(Z!==ee){const ue=t.get("EXT_clip_control");ee?ue.clipControlEXT(ue.LOWER_LEFT_EXT,ue.ZERO_TO_ONE_EXT):ue.clipControlEXT(ue.LOWER_LEFT_EXT,ue.NEGATIVE_ONE_TO_ONE_EXT),Z=ee;const we=Me;Me=null,this.setClear(we)}},getReversed:function(){return Z},setTest:function(ee){ee?ae(e.DEPTH_TEST):Te(e.DEPTH_TEST)},setMask:function(ee){j!==ee&&!L&&(e.depthMask(ee),j=ee)},setFunc:function(ee){if(Z&&(ee=wl[ee]),fe!==ee){switch(ee){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}fe=ee}},setLocked:function(ee){L=ee},setClear:function(ee){Me!==ee&&(Me=ee,Z&&(ee=1-ee),e.clearDepth(ee))},reset:function(){L=!1,j=null,fe=null,Me=null,Z=!1}}}function r(){let L=!1,Z=null,j=null,fe=null,Me=null,ee=null,ue=null,we=null,dt=null;return{setTest:function(Ye){L||(Ye?ae(e.STENCIL_TEST):Te(e.STENCIL_TEST))},setMask:function(Ye){Z!==Ye&&!L&&(e.stencilMask(Ye),Z=Ye)},setFunc:function(Ye,Ht,Jt){(j!==Ye||fe!==Ht||Me!==Jt)&&(e.stencilFunc(Ye,Ht,Jt),j=Ye,fe=Ht,Me=Jt)},setOp:function(Ye,Ht,Jt){(ee!==Ye||ue!==Ht||we!==Jt)&&(e.stencilOp(Ye,Ht,Jt),ee=Ye,ue=Ht,we=Jt)},setLocked:function(Ye){L=Ye},setClear:function(Ye){dt!==Ye&&(e.clearStencil(Ye),dt=Ye)},reset:function(){L=!1,Z=null,j=null,fe=null,Me=null,ee=null,ue=null,we=null,dt=null}}}const s=new n,a=new i,o=new r,c=new WeakMap,l=new WeakMap;let u={},f={},h={},p=new WeakMap,M=[],y=null,g=!1,d=null,A=null,I=null,x=null,T=null,b=null,w=null,_=new De(0,0,0),E=0,G=!1,U=null,O=null,Y=null,D=null,V=null;const J=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let H=!1,oe=0;const X=e.getParameter(e.VERSION);X.indexOf("WebGL")!==-1?(oe=parseFloat(/^WebGL (\d)/.exec(X)[1]),H=oe>=1):X.indexOf("OpenGL ES")!==-1&&(oe=parseFloat(/^OpenGL ES (\d)/.exec(X)[1]),H=oe>=2);let K=null,$={};const Ne=e.getParameter(e.SCISSOR_BOX),ye=e.getParameter(e.VIEWPORT),je=new rt().fromArray(Ne),Ue=new rt().fromArray(ye);function q(L,Z,j,fe){const Me=new Uint8Array(4),ee=e.createTexture();e.bindTexture(L,ee),e.texParameteri(L,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(L,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let ue=0;ue<j;ue++)L===e.TEXTURE_3D||L===e.TEXTURE_2D_ARRAY?e.texImage3D(Z,0,e.RGBA,1,1,fe,0,e.RGBA,e.UNSIGNED_BYTE,Me):e.texImage2D(Z+ue,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,Me);return ee}const ne={};ne[e.TEXTURE_2D]=q(e.TEXTURE_2D,e.TEXTURE_2D,1),ne[e.TEXTURE_CUBE_MAP]=q(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),ne[e.TEXTURE_2D_ARRAY]=q(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),ne[e.TEXTURE_3D]=q(e.TEXTURE_3D,e.TEXTURE_3D,1,1),s.setClear(0,0,0,1),a.setClear(1),o.setClear(0),ae(e.DEPTH_TEST),a.setFunc(3),wt(!1),et(1),ae(e.CULL_FACE),at(0);function ae(L){u[L]!==!0&&(e.enable(L),u[L]=!0)}function Te(L){u[L]!==!1&&(e.disable(L),u[L]=!1)}function Re(L,Z){return h[L]!==Z?(e.bindFramebuffer(L,Z),h[L]=Z,L===e.DRAW_FRAMEBUFFER&&(h[e.FRAMEBUFFER]=Z),L===e.FRAMEBUFFER&&(h[e.DRAW_FRAMEBUFFER]=Z),!0):!1}function de(L,Z){let j=M,fe=!1;if(L){j=p.get(Z),j===void 0&&(j=[],p.set(Z,j));const Me=L.textures;if(j.length!==Me.length||j[0]!==e.COLOR_ATTACHMENT0){for(let ee=0,ue=Me.length;ee<ue;ee++)j[ee]=e.COLOR_ATTACHMENT0+ee;j.length=Me.length,fe=!0}}else j[0]!==e.BACK&&(j[0]=e.BACK,fe=!0);fe&&e.drawBuffers(j)}function Ke(L){return y!==L?(e.useProgram(L),y=L,!0):!1}const Xe={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};Xe[103]=e.MIN,Xe[104]=e.MAX;const Le={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function at(L,Z,j,fe,Me,ee,ue,we,dt,Ye){if(L===0){g===!0&&(Te(e.BLEND),g=!1);return}if(g===!1&&(ae(e.BLEND),g=!0),L!==5){if(L!==d||Ye!==G){if((A!==100||T!==100)&&(e.blendEquation(e.FUNC_ADD),A=100,T=100),Ye)switch(L){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:Ce("WebGLState: Invalid blending: ",L)}else switch(L){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:Ce("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case 4:Ce("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Ce("WebGLState: Invalid blending: ",L)}I=null,x=null,b=null,w=null,_.set(0,0,0),E=0,d=L,G=Ye}return}Me=Me||Z,ee=ee||j,ue=ue||fe,(Z!==A||Me!==T)&&(e.blendEquationSeparate(Xe[Z],Xe[Me]),A=Z,T=Me),(j!==I||fe!==x||ee!==b||ue!==w)&&(e.blendFuncSeparate(Le[j],Le[fe],Le[ee],Le[ue]),I=j,x=fe,b=ee,w=ue),(we.equals(_)===!1||dt!==E)&&(e.blendColor(we.r,we.g,we.b,dt),_.copy(we),E=dt),d=L,G=!1}function St(L,Z){L.side===2?Te(e.CULL_FACE):ae(e.CULL_FACE);let j=L.side===1;Z&&(j=!j),wt(j),L.blending===1&&L.transparent===!1?at(0):at(L.blending,L.blendEquation,L.blendSrc,L.blendDst,L.blendEquationAlpha,L.blendSrcAlpha,L.blendDstAlpha,L.blendColor,L.blendAlpha,L.premultipliedAlpha),a.setFunc(L.depthFunc),a.setTest(L.depthTest),a.setMask(L.depthWrite),s.setMask(L.colorWrite);const fe=L.stencilWrite;o.setTest(fe),fe&&(o.setMask(L.stencilWriteMask),o.setFunc(L.stencilFunc,L.stencilRef,L.stencilFuncMask),o.setOp(L.stencilFail,L.stencilZFail,L.stencilZPass)),ht(L.polygonOffset,L.polygonOffsetFactor,L.polygonOffsetUnits),L.alphaToCoverage===!0?ae(e.SAMPLE_ALPHA_TO_COVERAGE):Te(e.SAMPLE_ALPHA_TO_COVERAGE)}function wt(L){U!==L&&(L?e.frontFace(e.CW):e.frontFace(e.CCW),U=L)}function et(L){L!==0?(ae(e.CULL_FACE),L!==O&&(L===1?e.cullFace(e.BACK):L===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))):Te(e.CULL_FACE),O=L}function bt(L){L!==Y&&(H&&e.lineWidth(L),Y=L)}function ht(L,Z,j){L?(ae(e.POLYGON_OFFSET_FILL),(D!==Z||V!==j)&&(D=Z,V=j,a.getReversed()&&(Z=-Z),e.polygonOffset(Z,j))):Te(e.POLYGON_OFFSET_FILL)}function ut(L){L?ae(e.SCISSOR_TEST):Te(e.SCISSOR_TEST)}function P(L){L===void 0&&(L=e.TEXTURE0+J-1),K!==L&&(e.activeTexture(L),K=L)}function At(L,Z,j){j===void 0&&(K===null?j=e.TEXTURE0+J-1:j=K);let fe=$[j];fe===void 0&&(fe={type:void 0,texture:void 0},$[j]=fe),(fe.type!==L||fe.texture!==Z)&&(K!==j&&(e.activeTexture(j),K=j),e.bindTexture(L,Z||ne[L]),fe.type=L,fe.texture=Z)}function qe(){const L=$[K];L!==void 0&&L.type!==void 0&&(e.bindTexture(L.type,null),L.type=void 0,L.texture=void 0)}function nt(){try{e.compressedTexImage2D(...arguments)}catch(L){Ce("WebGLState:",L)}}function S(){try{e.compressedTexImage3D(...arguments)}catch(L){Ce("WebGLState:",L)}}function m(){try{e.texSubImage2D(...arguments)}catch(L){Ce("WebGLState:",L)}}function R(){try{e.texSubImage3D(...arguments)}catch(L){Ce("WebGLState:",L)}}function k(){try{e.compressedTexSubImage2D(...arguments)}catch(L){Ce("WebGLState:",L)}}function Q(){try{e.compressedTexSubImage3D(...arguments)}catch(L){Ce("WebGLState:",L)}}function re(){try{e.texStorage2D(...arguments)}catch(L){Ce("WebGLState:",L)}}function le(){try{e.texStorage3D(...arguments)}catch(L){Ce("WebGLState:",L)}}function N(){try{e.texImage2D(...arguments)}catch(L){Ce("WebGLState:",L)}}function ie(){try{e.texImage3D(...arguments)}catch(L){Ce("WebGLState:",L)}}function pe(L){return f[L]!==void 0?f[L]:e.getParameter(L)}function ve(L,Z){f[L]!==Z&&(e.pixelStorei(L,Z),f[L]=Z)}function te(L){je.equals(L)===!1&&(e.scissor(L.x,L.y,L.z,L.w),je.copy(L))}function _e(L){Ue.equals(L)===!1&&(e.viewport(L.x,L.y,L.z,L.w),Ue.copy(L))}function Ee(L,Z){let j=l.get(Z);j===void 0&&(j=new WeakMap,l.set(Z,j));let fe=j.get(L);fe===void 0&&(fe=e.getUniformBlockIndex(Z,L.name),j.set(L,fe))}function Pe(L,Z){const j=l.get(Z).get(L);c.get(Z)!==j&&(e.uniformBlockBinding(Z,j,L.__bindingPointIndex),c.set(Z,j))}function He(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),a.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),u={},f={},K=null,$={},h={},p=new WeakMap,M=[],y=null,g=!1,d=null,A=null,I=null,x=null,T=null,b=null,w=null,_=new De(0,0,0),E=0,G=!1,U=null,O=null,Y=null,D=null,V=null,je.set(0,0,e.canvas.width,e.canvas.height),Ue.set(0,0,e.canvas.width,e.canvas.height),s.reset(),a.reset(),o.reset()}return{buffers:{color:s,depth:a,stencil:o},enable:ae,disable:Te,bindFramebuffer:Re,drawBuffers:de,useProgram:Ke,setBlending:at,setMaterial:St,setFlipSided:wt,setCullFace:et,setLineWidth:bt,setPolygonOffset:ht,setScissorTest:ut,activeTexture:P,bindTexture:At,unbindTexture:qe,compressedTexImage2D:nt,compressedTexImage3D:S,texImage2D:N,texImage3D:ie,pixelStorei:ve,getParameter:pe,updateUBOMapping:Ee,uniformBlockBinding:Pe,texStorage2D:re,texStorage3D:le,texSubImage2D:m,texSubImage3D:R,compressedTexSubImage2D:k,compressedTexSubImage3D:Q,scissor:te,viewport:_e,reset:He}}function ld(e,t,n,i,r,s,a){const o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new ze,u=new WeakMap,f=new Set;let h;const p=new WeakMap;let M=!1;try{M=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function y(S,m){return M?new OffscreenCanvas(S,m):or("canvas")}function g(S,m,R){let k=1;const Q=nt(S);if((Q.width>R||Q.height>R)&&(k=R/Math.max(Q.width,Q.height)),k<1)if(typeof HTMLImageElement<"u"&&S instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&S instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&S instanceof ImageBitmap||typeof VideoFrame<"u"&&S instanceof VideoFrame){const re=Math.floor(k*Q.width),le=Math.floor(k*Q.height);h===void 0&&(h=y(re,le));const N=m?y(re,le):h;return N.width=re,N.height=le,N.getContext("2d").drawImage(S,0,0,re,le),be("WebGLRenderer: Texture has been resized from ("+Q.width+"x"+Q.height+") to ("+re+"x"+le+")."),N}else return"data"in S&&be("WebGLRenderer: Image in DataTexture is too big ("+Q.width+"x"+Q.height+")."),S;return S}function d(S){return S.generateMipmaps}function A(S){e.generateMipmap(S)}function I(S){return S.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:S.isWebGL3DRenderTarget?e.TEXTURE_3D:S.isWebGLArrayRenderTarget||S.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function x(S,m,R,k,Q,re=!1){if(S!==null){if(e[S]!==void 0)return e[S];be("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+S+"'")}let le;k&&(le=t.get("EXT_texture_norm16"),le||be("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let N=m;if(m===e.RED&&(R===e.FLOAT&&(N=e.R32F),R===e.HALF_FLOAT&&(N=e.R16F),R===e.UNSIGNED_BYTE&&(N=e.R8),R===e.UNSIGNED_SHORT&&le&&(N=le.R16_EXT),R===e.SHORT&&le&&(N=le.R16_SNORM_EXT)),m===e.RED_INTEGER&&(R===e.UNSIGNED_BYTE&&(N=e.R8UI),R===e.UNSIGNED_SHORT&&(N=e.R16UI),R===e.UNSIGNED_INT&&(N=e.R32UI),R===e.BYTE&&(N=e.R8I),R===e.SHORT&&(N=e.R16I),R===e.INT&&(N=e.R32I)),m===e.RG&&(R===e.FLOAT&&(N=e.RG32F),R===e.HALF_FLOAT&&(N=e.RG16F),R===e.UNSIGNED_BYTE&&(N=e.RG8),R===e.UNSIGNED_SHORT&&le&&(N=le.RG16_EXT),R===e.SHORT&&le&&(N=le.RG16_SNORM_EXT)),m===e.RG_INTEGER&&(R===e.UNSIGNED_BYTE&&(N=e.RG8UI),R===e.UNSIGNED_SHORT&&(N=e.RG16UI),R===e.UNSIGNED_INT&&(N=e.RG32UI),R===e.BYTE&&(N=e.RG8I),R===e.SHORT&&(N=e.RG16I),R===e.INT&&(N=e.RG32I)),m===e.RGB_INTEGER&&(R===e.UNSIGNED_BYTE&&(N=e.RGB8UI),R===e.UNSIGNED_SHORT&&(N=e.RGB16UI),R===e.UNSIGNED_INT&&(N=e.RGB32UI),R===e.BYTE&&(N=e.RGB8I),R===e.SHORT&&(N=e.RGB16I),R===e.INT&&(N=e.RGB32I)),m===e.RGBA_INTEGER&&(R===e.UNSIGNED_BYTE&&(N=e.RGBA8UI),R===e.UNSIGNED_SHORT&&(N=e.RGBA16UI),R===e.UNSIGNED_INT&&(N=e.RGBA32UI),R===e.BYTE&&(N=e.RGBA8I),R===e.SHORT&&(N=e.RGBA16I),R===e.INT&&(N=e.RGBA32I)),m===e.RGB&&(R===e.UNSIGNED_SHORT&&le&&(N=le.RGB16_EXT),R===e.SHORT&&le&&(N=le.RGB16_SNORM_EXT),R===e.UNSIGNED_INT_5_9_9_9_REV&&(N=e.RGB9_E5),R===e.UNSIGNED_INT_10F_11F_11F_REV&&(N=e.R11F_G11F_B10F)),m===e.RGBA){const ie=re?sr:Ge.getTransfer(Q);R===e.FLOAT&&(N=e.RGBA32F),R===e.HALF_FLOAT&&(N=e.RGBA16F),R===e.UNSIGNED_BYTE&&(N=ie==="srgb"?e.SRGB8_ALPHA8:e.RGBA8),R===e.UNSIGNED_SHORT&&le&&(N=le.RGBA16_EXT),R===e.SHORT&&le&&(N=le.RGBA16_SNORM_EXT),R===e.UNSIGNED_SHORT_4_4_4_4&&(N=e.RGBA4),R===e.UNSIGNED_SHORT_5_5_5_1&&(N=e.RGB5_A1)}return(N===e.R16F||N===e.R32F||N===e.RG16F||N===e.RG32F||N===e.RGBA16F||N===e.RGBA32F)&&t.get("EXT_color_buffer_float"),N}function T(S,m){let R;return S?m===null||m===1014||m===1020?R=e.DEPTH24_STENCIL8:m===1015?R=e.DEPTH32F_STENCIL8:m===1012&&(R=e.DEPTH24_STENCIL8,be("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):m===null||m===1014||m===1020?R=e.DEPTH_COMPONENT24:m===1015?R=e.DEPTH_COMPONENT32F:m===1012&&(R=e.DEPTH_COMPONENT16),R}function b(S,m){return d(S)===!0||S.isFramebufferTexture&&S.minFilter!==1003&&S.minFilter!==1006?Math.log2(Math.max(m.width,m.height))+1:S.mipmaps!==void 0&&S.mipmaps.length>0?S.mipmaps.length:S.isCompressedTexture&&Array.isArray(S.image)?m.mipmaps.length:1}function w(S){const m=S.target;m.removeEventListener("dispose",w),E(m),m.isVideoTexture&&u.delete(m),m.isHTMLTexture&&f.delete(m)}function _(S){const m=S.target;m.removeEventListener("dispose",_),U(m)}function E(S){const m=i.get(S);if(m.__webglInit===void 0)return;const R=S.source,k=p.get(R);if(k){const Q=k[m.__cacheKey];Q.usedTimes--,Q.usedTimes===0&&G(S),Object.keys(k).length===0&&p.delete(R)}i.remove(S)}function G(S){const m=i.get(S);e.deleteTexture(m.__webglTexture);const R=S.source,k=p.get(R);delete k[m.__cacheKey],a.memory.textures--}function U(S){const m=i.get(S);if(S.depthTexture&&(S.depthTexture.dispose(),i.remove(S.depthTexture)),S.isWebGLCubeRenderTarget)for(let k=0;k<6;k++){if(Array.isArray(m.__webglFramebuffer[k]))for(let Q=0;Q<m.__webglFramebuffer[k].length;Q++)e.deleteFramebuffer(m.__webglFramebuffer[k][Q]);else e.deleteFramebuffer(m.__webglFramebuffer[k]);m.__webglDepthbuffer&&e.deleteRenderbuffer(m.__webglDepthbuffer[k])}else{if(Array.isArray(m.__webglFramebuffer))for(let k=0;k<m.__webglFramebuffer.length;k++)e.deleteFramebuffer(m.__webglFramebuffer[k]);else e.deleteFramebuffer(m.__webglFramebuffer);if(m.__webglDepthbuffer&&e.deleteRenderbuffer(m.__webglDepthbuffer),m.__webglMultisampledFramebuffer&&e.deleteFramebuffer(m.__webglMultisampledFramebuffer),m.__webglColorRenderbuffer)for(let k=0;k<m.__webglColorRenderbuffer.length;k++)m.__webglColorRenderbuffer[k]&&e.deleteRenderbuffer(m.__webglColorRenderbuffer[k]);m.__webglDepthRenderbuffer&&e.deleteRenderbuffer(m.__webglDepthRenderbuffer)}const R=S.textures;for(let k=0,Q=R.length;k<Q;k++){const re=i.get(R[k]);re.__webglTexture&&(e.deleteTexture(re.__webglTexture),a.memory.textures--),i.remove(R[k])}i.remove(S)}let O=0;function Y(){O=0}function D(){return O}function V(S){O=S}function J(){const S=O;return S>=r.maxTextures&&be("WebGLTextures: Trying to use "+(S+1)+" texture units while this GPU supports only "+r.maxTextures),O+=1,S}function H(S){const m=[];return m.push(S.wrapS),m.push(S.wrapT),m.push(S.wrapR||0),m.push(S.magFilter),m.push(S.minFilter),m.push(S.anisotropy),m.push(S.internalFormat),m.push(S.format),m.push(S.type),m.push(S.generateMipmaps),m.push(S.premultiplyAlpha),m.push(S.flipY),m.push(S.unpackAlignment),m.push(S.colorSpace),m.join()}function oe(S,m){const R=i.get(S);if(S.isVideoTexture&&At(S),S.isRenderTargetTexture===!1&&S.isExternalTexture!==!0&&S.version>0&&R.__version!==S.version){const k=S.image;if(k===null)be("WebGLRenderer: Texture marked for update but no image data found.");else if(k.complete===!1)be("WebGLRenderer: Texture marked for update but image is incomplete");else{Te(R,S,m);return}}else S.isExternalTexture&&(R.__webglTexture=S.sourceTexture?S.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,R.__webglTexture,e.TEXTURE0+m)}function X(S,m){const R=i.get(S);if(S.isRenderTargetTexture===!1&&S.version>0&&R.__version!==S.version){Te(R,S,m);return}else S.isExternalTexture&&(R.__webglTexture=S.sourceTexture?S.sourceTexture:null);n.bindTexture(e.TEXTURE_2D_ARRAY,R.__webglTexture,e.TEXTURE0+m)}function K(S,m){const R=i.get(S);if(S.isRenderTargetTexture===!1&&S.version>0&&R.__version!==S.version){Te(R,S,m);return}n.bindTexture(e.TEXTURE_3D,R.__webglTexture,e.TEXTURE0+m)}function $(S,m){const R=i.get(S);if(S.isCubeDepthTexture!==!0&&S.version>0&&R.__version!==S.version){Re(R,S,m);return}n.bindTexture(e.TEXTURE_CUBE_MAP,R.__webglTexture,e.TEXTURE0+m)}const Ne={[qr]:e.REPEAT,[nn]:e.CLAMP_TO_EDGE,[Yr]:e.MIRRORED_REPEAT},ye={[Et]:e.NEAREST,[Co]:e.NEAREST_MIPMAP_NEAREST,[Po]:e.NEAREST_MIPMAP_LINEAR,[Lt]:e.LINEAR,[Lo]:e.LINEAR_MIPMAP_NEAREST,[es]:e.LINEAR_MIPMAP_LINEAR},je={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function Ue(S,m){if(m.type===1015&&t.has("OES_texture_float_linear")===!1&&(m.magFilter===1006||m.magFilter===1007||m.magFilter===1005||m.magFilter===1008||m.minFilter===1006||m.minFilter===1007||m.minFilter===1005||m.minFilter===1008)&&be("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),e.texParameteri(S,e.TEXTURE_WRAP_S,Ne[m.wrapS]),e.texParameteri(S,e.TEXTURE_WRAP_T,Ne[m.wrapT]),(S===e.TEXTURE_3D||S===e.TEXTURE_2D_ARRAY)&&e.texParameteri(S,e.TEXTURE_WRAP_R,Ne[m.wrapR]),e.texParameteri(S,e.TEXTURE_MAG_FILTER,ye[m.magFilter]),e.texParameteri(S,e.TEXTURE_MIN_FILTER,ye[m.minFilter]),m.compareFunction&&(e.texParameteri(S,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(S,e.TEXTURE_COMPARE_FUNC,je[m.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(m.magFilter===1003||m.minFilter!==1005&&m.minFilter!==1008||m.type===1015&&t.has("OES_texture_float_linear")===!1)return;if(m.anisotropy>1||i.get(m).__currentAnisotropy){const R=t.get("EXT_texture_filter_anisotropic");e.texParameterf(S,R.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(m.anisotropy,r.getMaxAnisotropy())),i.get(m).__currentAnisotropy=m.anisotropy}}}function q(S,m){let R=!1;S.__webglInit===void 0&&(S.__webglInit=!0,m.addEventListener("dispose",w));const k=m.source;let Q=p.get(k);Q===void 0&&(Q={},p.set(k,Q));const re=H(m);if(re!==S.__cacheKey){Q[re]===void 0&&(Q[re]={texture:e.createTexture(),usedTimes:0},a.memory.textures++,R=!0),Q[re].usedTimes++;const le=Q[S.__cacheKey];le!==void 0&&(Q[S.__cacheKey].usedTimes--,le.usedTimes===0&&G(m)),S.__cacheKey=re,S.__webglTexture=Q[re].texture}return R}function ne(S,m,R){return Math.floor(Math.floor(S/R)/m)}function ae(S,m,R,k){const re=S.updateRanges;if(re.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,m.width,m.height,R,k,m.data);else{re.sort((ve,te)=>ve.start-te.start);let le=0;for(let ve=1;ve<re.length;ve++){const te=re[le],_e=re[ve],Ee=te.start+te.count,Pe=ne(_e.start,m.width,4),He=ne(te.start,m.width,4);_e.start<=Ee+1&&Pe===He&&ne(_e.start+_e.count-1,m.width,4)===Pe?te.count=Math.max(te.count,_e.start+_e.count-te.start):(++le,re[le]=_e)}re.length=le+1;const N=n.getParameter(e.UNPACK_ROW_LENGTH),ie=n.getParameter(e.UNPACK_SKIP_PIXELS),pe=n.getParameter(e.UNPACK_SKIP_ROWS);n.pixelStorei(e.UNPACK_ROW_LENGTH,m.width);for(let ve=0,te=re.length;ve<te;ve++){const _e=re[ve],Ee=Math.floor(_e.start/4),Pe=Math.ceil(_e.count/4),He=Ee%m.width,L=Math.floor(Ee/m.width),Z=Pe,j=1;n.pixelStorei(e.UNPACK_SKIP_PIXELS,He),n.pixelStorei(e.UNPACK_SKIP_ROWS,L),n.texSubImage2D(e.TEXTURE_2D,0,He,L,Z,j,R,k,m.data)}S.clearUpdateRanges(),n.pixelStorei(e.UNPACK_ROW_LENGTH,N),n.pixelStorei(e.UNPACK_SKIP_PIXELS,ie),n.pixelStorei(e.UNPACK_SKIP_ROWS,pe)}}function Te(S,m,R){let k=e.TEXTURE_2D;(m.isDataArrayTexture||m.isCompressedArrayTexture)&&(k=e.TEXTURE_2D_ARRAY),m.isData3DTexture&&(k=e.TEXTURE_3D);const Q=q(S,m),re=m.source;n.bindTexture(k,S.__webglTexture,e.TEXTURE0+R);const le=i.get(re);if(re.version!==le.__version||Q===!0){if(n.activeTexture(e.TEXTURE0+R),!(typeof ImageBitmap<"u"&&m.image instanceof ImageBitmap)){const Z=Ge.getPrimaries(Ge.workingColorSpace),j=m.colorSpace===""?null:Ge.getPrimaries(m.colorSpace),fe=m.colorSpace===""||Z===j?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,m.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,m.premultiplyAlpha),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,fe)}n.pixelStorei(e.UNPACK_ALIGNMENT,m.unpackAlignment);let N=g(m.image,!1,r.maxTextureSize);N=qe(m,N);const ie=s.convert(m.format,m.colorSpace),pe=s.convert(m.type);let ve=x(m.internalFormat,ie,pe,m.normalized,m.colorSpace,m.isVideoTexture);Ue(k,m);let te;const _e=m.mipmaps,Ee=m.isVideoTexture!==!0,Pe=le.__version===void 0||Q===!0,He=re.dataReady,L=b(m,N);if(m.isDepthTexture)ve=T(m.format===Oa,m.type),Pe&&(Ee?n.texStorage2D(e.TEXTURE_2D,1,ve,N.width,N.height):n.texImage2D(e.TEXTURE_2D,0,ve,N.width,N.height,0,ie,pe,null));else if(m.isDataTexture)if(_e.length>0){Ee&&Pe&&n.texStorage2D(e.TEXTURE_2D,L,ve,_e[0].width,_e[0].height);for(let Z=0,j=_e.length;Z<j;Z++)te=_e[Z],Ee?He&&n.texSubImage2D(e.TEXTURE_2D,Z,0,0,te.width,te.height,ie,pe,te.data):n.texImage2D(e.TEXTURE_2D,Z,ve,te.width,te.height,0,ie,pe,te.data);m.generateMipmaps=!1}else Ee?(Pe&&n.texStorage2D(e.TEXTURE_2D,L,ve,N.width,N.height),He&&ae(m,N,ie,pe)):n.texImage2D(e.TEXTURE_2D,0,ve,N.width,N.height,0,ie,pe,N.data);else if(m.isCompressedTexture)if(m.isCompressedArrayTexture){Ee&&Pe&&n.texStorage3D(e.TEXTURE_2D_ARRAY,L,ve,_e[0].width,_e[0].height,N.depth);for(let Z=0,j=_e.length;Z<j;Z++)if(te=_e[Z],m.format!==1023)if(ie!==null)if(Ee){if(He)if(m.layerUpdates.size>0){const fe=ea(te.width,te.height,m.format,m.type);for(const Me of m.layerUpdates){const ee=te.data.subarray(Me*fe/te.data.BYTES_PER_ELEMENT,(Me+1)*fe/te.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,Z,0,0,Me,te.width,te.height,1,ie,ee)}}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,Z,0,0,0,te.width,te.height,N.depth,ie,te.data)}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,Z,ve,te.width,te.height,N.depth,0,te.data,0,0);else be("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ee?He&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,Z,0,0,0,te.width,te.height,N.depth,ie,pe,te.data):n.texImage3D(e.TEXTURE_2D_ARRAY,Z,ve,te.width,te.height,N.depth,0,ie,pe,te.data);m.layerUpdates.size>0&&m.clearLayerUpdates()}else{Ee&&Pe&&n.texStorage2D(e.TEXTURE_2D,L,ve,_e[0].width,_e[0].height);for(let Z=0,j=_e.length;Z<j;Z++)te=_e[Z],m.format!==1023?ie!==null?Ee?He&&n.compressedTexSubImage2D(e.TEXTURE_2D,Z,0,0,te.width,te.height,ie,te.data):n.compressedTexImage2D(e.TEXTURE_2D,Z,ve,te.width,te.height,0,te.data):be("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ee?He&&n.texSubImage2D(e.TEXTURE_2D,Z,0,0,te.width,te.height,ie,pe,te.data):n.texImage2D(e.TEXTURE_2D,Z,ve,te.width,te.height,0,ie,pe,te.data)}else if(m.isDataArrayTexture)if(Ee){if(Pe&&n.texStorage3D(e.TEXTURE_2D_ARRAY,L,ve,N.width,N.height,N.depth),He)if(m.layerUpdates.size>0){const Z=ea(N.width,N.height,m.format,m.type);for(const j of m.layerUpdates){const fe=N.data.subarray(j*Z/N.data.BYTES_PER_ELEMENT,(j+1)*Z/N.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,j,N.width,N.height,1,ie,pe,fe)}m.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,N.width,N.height,N.depth,ie,pe,N.data)}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,ve,N.width,N.height,N.depth,0,ie,pe,N.data);else if(m.isData3DTexture)Ee?(Pe&&n.texStorage3D(e.TEXTURE_3D,L,ve,N.width,N.height,N.depth),He&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,N.width,N.height,N.depth,ie,pe,N.data)):n.texImage3D(e.TEXTURE_3D,0,ve,N.width,N.height,N.depth,0,ie,pe,N.data);else if(m.isFramebufferTexture){if(Pe)if(Ee)n.texStorage2D(e.TEXTURE_2D,L,ve,N.width,N.height);else{let Z=N.width,j=N.height;for(let fe=0;fe<L;fe++)n.texImage2D(e.TEXTURE_2D,fe,ve,Z,j,0,ie,pe,null),Z>>=1,j>>=1}}else if(m.isHTMLTexture){if("texElementImage2D"in e){const Z=e.canvas;if(Z.hasAttribute("layoutsubtree")||Z.setAttribute("layoutsubtree","true"),N.parentNode!==Z){Z.appendChild(N),f.add(m),Z.onpaint=j=>{const fe=j.changedElements;for(const Me of f)fe.includes(Me.image)&&(Me.needsUpdate=!0)},Z.requestPaint();return}if(e.texElementImage2D.length===3)e.texElementImage2D(e.TEXTURE_2D,e.RGBA8,N);else{const fe=e.RGBA,Me=e.RGBA,ee=e.UNSIGNED_BYTE;e.texElementImage2D(e.TEXTURE_2D,0,fe,Me,ee,N)}e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}}else if(_e.length>0){if(Ee&&Pe){const Z=nt(_e[0]);n.texStorage2D(e.TEXTURE_2D,L,ve,Z.width,Z.height)}for(let Z=0,j=_e.length;Z<j;Z++)te=_e[Z],Ee?He&&n.texSubImage2D(e.TEXTURE_2D,Z,0,0,ie,pe,te):n.texImage2D(e.TEXTURE_2D,Z,ve,ie,pe,te);m.generateMipmaps=!1}else if(Ee){if(Pe){const Z=nt(N);n.texStorage2D(e.TEXTURE_2D,L,ve,Z.width,Z.height)}He&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,ie,pe,N)}else n.texImage2D(e.TEXTURE_2D,0,ve,ie,pe,N);d(m)&&A(k),le.__version=re.version,m.onUpdate&&m.onUpdate(m)}S.__version=m.version}function Re(S,m,R){if(m.image.length!==6)return;const k=q(S,m),Q=m.source;n.bindTexture(e.TEXTURE_CUBE_MAP,S.__webglTexture,e.TEXTURE0+R);const re=i.get(Q);if(Q.version!==re.__version||k===!0){n.activeTexture(e.TEXTURE0+R);const le=Ge.getPrimaries(Ge.workingColorSpace),N=m.colorSpace===""?null:Ge.getPrimaries(m.colorSpace),ie=m.colorSpace===""||le===N?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,m.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,m.premultiplyAlpha),n.pixelStorei(e.UNPACK_ALIGNMENT,m.unpackAlignment),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,ie);const pe=m.isCompressedTexture||m.image[0].isCompressedTexture,ve=m.image[0]&&m.image[0].isDataTexture,te=[];for(let ee=0;ee<6;ee++)!pe&&!ve?te[ee]=g(m.image[ee],!0,r.maxCubemapSize):te[ee]=ve?m.image[ee].image:m.image[ee],te[ee]=qe(m,te[ee]);const _e=te[0],Ee=s.convert(m.format,m.colorSpace),Pe=s.convert(m.type),He=x(m.internalFormat,Ee,Pe,m.normalized,m.colorSpace),L=m.isVideoTexture!==!0,Z=re.__version===void 0||k===!0,j=Q.dataReady;let fe=b(m,_e);Ue(e.TEXTURE_CUBE_MAP,m);let Me;if(pe){L&&Z&&n.texStorage2D(e.TEXTURE_CUBE_MAP,fe,He,_e.width,_e.height);for(let ee=0;ee<6;ee++){Me=te[ee].mipmaps;for(let ue=0;ue<Me.length;ue++){const we=Me[ue];m.format!==1023?Ee!==null?L?j&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+ee,ue,0,0,we.width,we.height,Ee,we.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+ee,ue,He,we.width,we.height,0,we.data):be("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):L?j&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+ee,ue,0,0,we.width,we.height,Ee,Pe,we.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+ee,ue,He,we.width,we.height,0,Ee,Pe,we.data)}}}else{if(Me=m.mipmaps,L&&Z){Me.length>0&&fe++;const ee=nt(te[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,fe,He,ee.width,ee.height)}for(let ee=0;ee<6;ee++)if(ve){L?j&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+ee,0,0,0,te[ee].width,te[ee].height,Ee,Pe,te[ee].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+ee,0,He,te[ee].width,te[ee].height,0,Ee,Pe,te[ee].data);for(let ue=0;ue<Me.length;ue++){const we=Me[ue].image[ee].image;L?j&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+ee,ue+1,0,0,we.width,we.height,Ee,Pe,we.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+ee,ue+1,He,we.width,we.height,0,Ee,Pe,we.data)}}else{L?j&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+ee,0,0,0,Ee,Pe,te[ee]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+ee,0,He,Ee,Pe,te[ee]);for(let ue=0;ue<Me.length;ue++){const we=Me[ue];L?j&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+ee,ue+1,0,0,Ee,Pe,we.image[ee]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+ee,ue+1,He,Ee,Pe,we.image[ee])}}}d(m)&&A(e.TEXTURE_CUBE_MAP),re.__version=Q.version,m.onUpdate&&m.onUpdate(m)}S.__version=m.version}function de(S,m,R,k,Q,re){const le=s.convert(R.format,R.colorSpace),N=s.convert(R.type),ie=x(R.internalFormat,le,N,R.normalized,R.colorSpace),pe=i.get(m),ve=i.get(R);if(ve.__renderTarget=m,!pe.__hasExternalTextures){const te=Math.max(1,m.width>>re),_e=Math.max(1,m.height>>re);Q===e.TEXTURE_3D||Q===e.TEXTURE_2D_ARRAY?n.texImage3D(Q,re,ie,te,_e,m.depth,0,le,N,null):n.texImage2D(Q,re,ie,te,_e,0,le,N,null)}n.bindFramebuffer(e.FRAMEBUFFER,S),P(m)?o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,k,Q,ve.__webglTexture,0,ut(m)):(Q===e.TEXTURE_2D||Q>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&Q<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,k,Q,ve.__webglTexture,re),n.bindFramebuffer(e.FRAMEBUFFER,null)}function Ke(S,m,R){if(e.bindRenderbuffer(e.RENDERBUFFER,S),m.depthBuffer){const k=m.depthTexture,Q=k&&k.isDepthTexture?k.type:null,re=T(m.stencilBuffer,Q),le=m.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;P(m)?o.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,ut(m),re,m.width,m.height):R?e.renderbufferStorageMultisample(e.RENDERBUFFER,ut(m),re,m.width,m.height):e.renderbufferStorage(e.RENDERBUFFER,re,m.width,m.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,le,e.RENDERBUFFER,S)}else{const k=m.textures;for(let Q=0;Q<k.length;Q++){const re=k[Q],le=s.convert(re.format,re.colorSpace),N=s.convert(re.type),ie=x(re.internalFormat,le,N,re.normalized,re.colorSpace);P(m)?o.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,ut(m),ie,m.width,m.height):R?e.renderbufferStorageMultisample(e.RENDERBUFFER,ut(m),ie,m.width,m.height):e.renderbufferStorage(e.RENDERBUFFER,ie,m.width,m.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function Xe(S,m,R){const k=m.isWebGLCubeRenderTarget===!0;if(n.bindFramebuffer(e.FRAMEBUFFER,S),!(m.depthTexture&&m.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const Q=i.get(m.depthTexture);if(Q.__renderTarget=m,(!Q.__webglTexture||m.depthTexture.image.width!==m.width||m.depthTexture.image.height!==m.height)&&(m.depthTexture.image.width=m.width,m.depthTexture.image.height=m.height,m.depthTexture.needsUpdate=!0),k){if(Q.__webglInit===void 0&&(Q.__webglInit=!0,m.depthTexture.addEventListener("dispose",w)),Q.__webglTexture===void 0){Q.__webglTexture=e.createTexture(),n.bindTexture(e.TEXTURE_CUBE_MAP,Q.__webglTexture),Ue(e.TEXTURE_CUBE_MAP,m.depthTexture);const pe=s.convert(m.depthTexture.format),ve=s.convert(m.depthTexture.type);let te;m.depthTexture.format===1026?te=e.DEPTH_COMPONENT24:m.depthTexture.format===1027&&(te=e.DEPTH24_STENCIL8);for(let _e=0;_e<6;_e++)e.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+_e,0,te,m.width,m.height,0,pe,ve,null)}}else oe(m.depthTexture,0);const re=Q.__webglTexture,le=ut(m),N=k?e.TEXTURE_CUBE_MAP_POSITIVE_X+R:e.TEXTURE_2D,ie=m.depthTexture.format===1027?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(m.depthTexture.format===1026)P(m)?o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,ie,N,re,0,le):e.framebufferTexture2D(e.FRAMEBUFFER,ie,N,re,0);else if(m.depthTexture.format===1027)P(m)?o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,ie,N,re,0,le):e.framebufferTexture2D(e.FRAMEBUFFER,ie,N,re,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function Le(S){const m=i.get(S),R=S.isWebGLCubeRenderTarget===!0;if(m.__boundDepthTexture!==S.depthTexture){const k=S.depthTexture;if(m.__depthDisposeCallback&&m.__depthDisposeCallback(),k){const Q=()=>{delete m.__boundDepthTexture,delete m.__depthDisposeCallback,k.removeEventListener("dispose",Q)};k.addEventListener("dispose",Q),m.__depthDisposeCallback=Q}m.__boundDepthTexture=k}if(S.depthTexture&&!m.__autoAllocateDepthBuffer)if(R)for(let k=0;k<6;k++)Xe(m.__webglFramebuffer[k],S,k);else{const k=S.texture.mipmaps;k&&k.length>0?Xe(m.__webglFramebuffer[0],S,0):Xe(m.__webglFramebuffer,S,0)}else if(R){m.__webglDepthbuffer=[];for(let k=0;k<6;k++)if(n.bindFramebuffer(e.FRAMEBUFFER,m.__webglFramebuffer[k]),m.__webglDepthbuffer[k]===void 0)m.__webglDepthbuffer[k]=e.createRenderbuffer(),Ke(m.__webglDepthbuffer[k],S,!1);else{const Q=S.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,re=m.__webglDepthbuffer[k];e.bindRenderbuffer(e.RENDERBUFFER,re),e.framebufferRenderbuffer(e.FRAMEBUFFER,Q,e.RENDERBUFFER,re)}}else{const k=S.texture.mipmaps;if(k&&k.length>0?n.bindFramebuffer(e.FRAMEBUFFER,m.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,m.__webglFramebuffer),m.__webglDepthbuffer===void 0)m.__webglDepthbuffer=e.createRenderbuffer(),Ke(m.__webglDepthbuffer,S,!1);else{const Q=S.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,re=m.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,re),e.framebufferRenderbuffer(e.FRAMEBUFFER,Q,e.RENDERBUFFER,re)}}n.bindFramebuffer(e.FRAMEBUFFER,null)}function at(S,m,R){const k=i.get(S);m!==void 0&&de(k.__webglFramebuffer,S,S.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),R!==void 0&&Le(S)}function St(S){const m=S.texture,R=i.get(S),k=i.get(m);S.addEventListener("dispose",_);const Q=S.textures,re=S.isWebGLCubeRenderTarget===!0,le=Q.length>1;if(le||(k.__webglTexture===void 0&&(k.__webglTexture=e.createTexture()),k.__version=m.version,a.memory.textures++),re){R.__webglFramebuffer=[];for(let N=0;N<6;N++)if(m.mipmaps&&m.mipmaps.length>0){R.__webglFramebuffer[N]=[];for(let ie=0;ie<m.mipmaps.length;ie++)R.__webglFramebuffer[N][ie]=e.createFramebuffer()}else R.__webglFramebuffer[N]=e.createFramebuffer()}else{if(m.mipmaps&&m.mipmaps.length>0){R.__webglFramebuffer=[];for(let N=0;N<m.mipmaps.length;N++)R.__webglFramebuffer[N]=e.createFramebuffer()}else R.__webglFramebuffer=e.createFramebuffer();if(le)for(let N=0,ie=Q.length;N<ie;N++){const pe=i.get(Q[N]);pe.__webglTexture===void 0&&(pe.__webglTexture=e.createTexture(),a.memory.textures++)}if(S.samples>0&&P(S)===!1){R.__webglMultisampledFramebuffer=e.createFramebuffer(),R.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,R.__webglMultisampledFramebuffer);for(let N=0;N<Q.length;N++){const ie=Q[N];R.__webglColorRenderbuffer[N]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,R.__webglColorRenderbuffer[N]);const pe=s.convert(ie.format,ie.colorSpace),ve=s.convert(ie.type),te=x(ie.internalFormat,pe,ve,ie.normalized,ie.colorSpace,S.isXRRenderTarget===!0),_e=ut(S);e.renderbufferStorageMultisample(e.RENDERBUFFER,_e,te,S.width,S.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+N,e.RENDERBUFFER,R.__webglColorRenderbuffer[N])}e.bindRenderbuffer(e.RENDERBUFFER,null),S.depthBuffer&&(R.__webglDepthRenderbuffer=e.createRenderbuffer(),Ke(R.__webglDepthRenderbuffer,S,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(re){n.bindTexture(e.TEXTURE_CUBE_MAP,k.__webglTexture),Ue(e.TEXTURE_CUBE_MAP,m);for(let N=0;N<6;N++)if(m.mipmaps&&m.mipmaps.length>0)for(let ie=0;ie<m.mipmaps.length;ie++)de(R.__webglFramebuffer[N][ie],S,m,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+N,ie);else de(R.__webglFramebuffer[N],S,m,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+N,0);d(m)&&A(e.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(le){for(let N=0,ie=Q.length;N<ie;N++){const pe=Q[N],ve=i.get(pe);let te=e.TEXTURE_2D;(S.isWebGL3DRenderTarget||S.isWebGLArrayRenderTarget)&&(te=S.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(te,ve.__webglTexture),Ue(te,pe),de(R.__webglFramebuffer,S,pe,e.COLOR_ATTACHMENT0+N,te,0),d(pe)&&A(te)}n.unbindTexture()}else{let N=e.TEXTURE_2D;if((S.isWebGL3DRenderTarget||S.isWebGLArrayRenderTarget)&&(N=S.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(N,k.__webglTexture),Ue(N,m),m.mipmaps&&m.mipmaps.length>0)for(let ie=0;ie<m.mipmaps.length;ie++)de(R.__webglFramebuffer[ie],S,m,e.COLOR_ATTACHMENT0,N,ie);else de(R.__webglFramebuffer,S,m,e.COLOR_ATTACHMENT0,N,0);d(m)&&A(N),n.unbindTexture()}S.depthBuffer&&Le(S)}function wt(S){const m=S.textures;for(let R=0,k=m.length;R<k;R++){const Q=m[R];if(d(Q)){const re=I(S),le=i.get(Q).__webglTexture;n.bindTexture(re,le),A(re),n.unbindTexture()}}}const et=[],bt=[];function ht(S){if(S.samples>0){if(P(S)===!1){const m=S.textures,R=S.width,k=S.height;let Q=e.COLOR_BUFFER_BIT;const re=S.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,le=i.get(S),N=m.length>1;if(N)for(let pe=0;pe<m.length;pe++)n.bindFramebuffer(e.FRAMEBUFFER,le.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+pe,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,le.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+pe,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,le.__webglMultisampledFramebuffer);const ie=S.texture.mipmaps;ie&&ie.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,le.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,le.__webglFramebuffer);for(let pe=0;pe<m.length;pe++){if(S.resolveDepthBuffer&&(S.depthBuffer&&(Q|=e.DEPTH_BUFFER_BIT),S.stencilBuffer&&S.resolveStencilBuffer&&(Q|=e.STENCIL_BUFFER_BIT)),N){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,le.__webglColorRenderbuffer[pe]);const ve=i.get(m[pe]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,ve,0)}e.blitFramebuffer(0,0,R,k,0,0,R,k,Q,e.NEAREST),c===!0&&(et.length=0,bt.length=0,et.push(e.COLOR_ATTACHMENT0+pe),S.depthBuffer&&S.storeMultisampledDepthBuffer===!1&&(et.push(re),bt.push(re),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,bt)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,et))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),N)for(let pe=0;pe<m.length;pe++){n.bindFramebuffer(e.FRAMEBUFFER,le.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+pe,e.RENDERBUFFER,le.__webglColorRenderbuffer[pe]);const ve=i.get(m[pe]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,le.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+pe,e.TEXTURE_2D,ve,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,le.__webglMultisampledFramebuffer)}else if(S.depthBuffer&&S.storeMultisampledDepthBuffer===!1&&c){const m=S.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[m])}}}function ut(S){return Math.min(r.maxSamples,S.samples)}function P(S){const m=i.get(S);return S.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&m.__useRenderToTexture!==!1}function At(S){const m=a.render.frame;u.get(S)!==m&&(u.set(S,m),S.update())}function qe(S,m){const R=S.colorSpace,k=S.format,Q=S.type;return S.isCompressedTexture===!0||S.isVideoTexture===!0||R!=="srgb-linear"&&R!==""&&(Ge.getTransfer(R)==="srgb"?(k!==1023||Q!==1009)&&be("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Ce("WebGLTextures: Unsupported texture color space:",R)),m}function nt(S){return typeof HTMLImageElement<"u"&&S instanceof HTMLImageElement?(l.width=S.naturalWidth||S.width,l.height=S.naturalHeight||S.height):typeof VideoFrame<"u"&&S instanceof VideoFrame?(l.width=S.displayWidth,l.height=S.displayHeight):(l.width=S.width,l.height=S.height),l}this.allocateTextureUnit=J,this.resetTextureUnits=Y,this.getTextureUnits=D,this.setTextureUnits=V,this.setTexture2D=oe,this.setTexture2DArray=X,this.setTexture3D=K,this.setTextureCube=$,this.rebindTextures=at,this.setupRenderTarget=St,this.updateRenderTargetMipmap=wt,this.updateMultisampleRenderTarget=ht,this.setupDepthRenderbuffer=Le,this.setupFrameBufferTexture=de,this.useMultisampledRTT=P,this.isReversedDepthBuffer=function(){return n.buffers.depth.getReversed()}}function cd(e,t){function n(i,r=""){let s;const a=Ge.getTransfer(r);if(i===1009)return e.UNSIGNED_BYTE;if(i===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(i===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(i===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(i===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(i===1010)return e.BYTE;if(i===1011)return e.SHORT;if(i===1012)return e.UNSIGNED_SHORT;if(i===1013)return e.INT;if(i===1014)return e.UNSIGNED_INT;if(i===1015)return e.FLOAT;if(i===1016)return e.HALF_FLOAT;if(i===1021)return e.ALPHA;if(i===1022)return e.RGB;if(i===1023)return e.RGBA;if(i===1026)return e.DEPTH_COMPONENT;if(i===1027)return e.DEPTH_STENCIL;if(i===1028)return e.RED;if(i===1029)return e.RED_INTEGER;if(i===1030)return e.RG;if(i===1031)return e.RG_INTEGER;if(i===1033)return e.RGBA_INTEGER;if(i===33776||i===33777||i===33778||i===33779)if(a==="srgb")if(s=t.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(i===33776)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===33777)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===33778)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===33779)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=t.get("WEBGL_compressed_texture_s3tc"),s!==null){if(i===33776)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===33777)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===33778)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===33779)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===35840||i===35841||i===35842||i===35843)if(s=t.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(i===35840)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===35841)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===35842)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===35843)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===36196||i===37492||i===37496||i===37488||i===37489||i===37490||i===37491)if(s=t.get("WEBGL_compressed_texture_etc"),s!==null){if(i===36196||i===37492)return a==="srgb"?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(i===37496)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC;if(i===37488)return s.COMPRESSED_R11_EAC;if(i===37489)return s.COMPRESSED_SIGNED_R11_EAC;if(i===37490)return s.COMPRESSED_RG11_EAC;if(i===37491)return s.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===37808||i===37809||i===37810||i===37811||i===37812||i===37813||i===37814||i===37815||i===37816||i===37817||i===37818||i===37819||i===37820||i===37821)if(s=t.get("WEBGL_compressed_texture_astc"),s!==null){if(i===37808)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===37809)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===37810)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===37811)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===37812)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===37813)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===37814)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===37815)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===37816)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===37817)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===37818)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===37819)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===37820)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===37821)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===36492||i===36494||i===36495)if(s=t.get("EXT_texture_compression_bptc"),s!==null){if(i===36492)return a==="srgb"?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===36494)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===36495)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===36283||i===36284||i===36285||i===36286)if(s=t.get("EXT_texture_compression_rgtc"),s!==null){if(i===36283)return s.COMPRESSED_RED_RGTC1_EXT;if(i===36284)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===36285)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===36286)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===1020?e.UNSIGNED_INT_24_8:e[i]!==void 0?e[i]:null}return{convert:n}}var hd=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,ud=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,dd=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const n=new to(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new Kt({vertexShader:hd,fragmentShader:ud,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new gt(new so(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},fd=class extends Tn{constructor(e,t){super();const n=this;let i=null,r=1,s=null,a="local-floor",o=1,c=null,l=null,u=null,f=null,h=null,p=null;const M=typeof XRWebGLBinding<"u",y=new dd,g={},d=t.getContextAttributes();let A=null,I=null;const x=[],T=[],b=new ze;let w=null,_=null;const E=new Nt;E.viewport=new rt;const G=new Nt;G.viewport=new rt;const U=[E,G],O=new Wc;let Y=null,D=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(q){let ne=x[q];return ne===void 0&&(ne=new yr,x[q]=ne),ne.getTargetRaySpace()},this.getControllerGrip=function(q){let ne=x[q];return ne===void 0&&(ne=new yr,x[q]=ne),ne.getGripSpace()},this.getHand=function(q){let ne=x[q];return ne===void 0&&(ne=new yr,x[q]=ne),ne.getHandSpace()};function V(q){const ne=T.indexOf(q.inputSource);if(ne===-1)return;const ae=x[ne];ae!==void 0&&(ae.update(q.inputSource,q.frame,c||s),ae.dispatchEvent({type:q.type,data:q.inputSource}))}function J(){i.removeEventListener("select",V),i.removeEventListener("selectstart",V),i.removeEventListener("selectend",V),i.removeEventListener("squeeze",V),i.removeEventListener("squeezestart",V),i.removeEventListener("squeezeend",V),i.removeEventListener("end",J),i.removeEventListener("inputsourceschange",H);for(let q=0;q<x.length;q++){const ne=T[q];ne!==null&&(T[q]=null,x[q].disconnect(ne))}Y=null,D=null,y.reset();for(const q in g)delete g[q];if(e.setRenderTarget(A),h=null,f=null,u=null,i=null,I=null,Ue.stop(),n.isPresenting=!1,e.setPixelRatio(w),e.setSize(b.width,b.height,!1),_!==null){const q=_.camera;q.fov=_.fov,q.zoom=_.zoom,q.updateProjectionMatrix(),_=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(q){r=q,n.isPresenting===!0&&be("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(q){a=q,n.isPresenting===!0&&be("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||s},this.setReferenceSpace=function(q){c=q},this.getBaseLayer=function(){return f!==null?f:h},this.getBinding=function(){return u===null&&M&&(u=new XRWebGLBinding(i,t)),u},this.getFrame=function(){return p},this.getSession=function(){return i},this.setSession=async function(q){if(i=q,i!==null){if(A=e.getRenderTarget(),i.addEventListener("select",V),i.addEventListener("selectstart",V),i.addEventListener("selectend",V),i.addEventListener("squeeze",V),i.addEventListener("squeezestart",V),i.addEventListener("squeezeend",V),i.addEventListener("end",J),i.addEventListener("inputsourceschange",H),d.xrCompatible!==!0&&await t.makeXRCompatible(),w=e.getPixelRatio(),e.getSize(b),M&&"createProjectionLayer"in XRWebGLBinding.prototype){let ne=null,ae=null,Te=null;d.depth&&(Te=d.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ne=d.stencil?Oa:vi,ae=d.stencil?Na:yn);const Re={colorFormat:t.RGBA8,depthFormat:Te,scaleFactor:r};u=this.getBinding(),f=u.createProjectionLayer(Re),i.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),I=new Vt(f.textureWidth,f.textureHeight,{format:_i,type:fn,depthTexture:new Si(f.textureWidth,f.textureHeight,ae,void 0,void 0,void 0,void 0,void 0,void 0,ne),stencilBuffer:d.stencil,colorSpace:e.outputColorSpace,samples:d.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}else{const ne={antialias:d.antialias,alpha:!0,depth:d.depth,stencil:d.stencil,framebufferScaleFactor:r};h=new XRWebGLLayer(i,t,ne),i.updateRenderState({baseLayer:h}),e.setPixelRatio(1),e.setSize(h.framebufferWidth,h.framebufferHeight,!1),I=new Vt(h.framebufferWidth,h.framebufferHeight,{format:_i,type:fn,colorSpace:e.outputColorSpace,stencilBuffer:d.stencil,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1,storeMultisampledDepthBuffer:h.ignoreDepthValues===!1,storeMultisampledStencilBuffer:h.ignoreDepthValues===!1})}I.isXRRenderTarget=!0,this.setFoveation(o),c=null,s=await i.requestReferenceSpace(a),Ue.setContext(i),Ue.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return y.getDepthTexture()};function H(q){for(let ne=0;ne<q.removed.length;ne++){const ae=q.removed[ne],Te=T.indexOf(ae);Te>=0&&(T[Te]=null,x[Te].disconnect(ae))}for(let ne=0;ne<q.added.length;ne++){const ae=q.added[ne];let Te=T.indexOf(ae);if(Te===-1){for(let de=0;de<x.length;de++)if(de>=T.length){T.push(ae),Te=de;break}else if(T[de]===null){T[de]=ae,Te=de;break}if(Te===-1)break}const Re=x[Te];Re&&Re.connect(ae)}}const oe=new B,X=new B;function K(q,ne,ae){oe.setFromMatrixPosition(ne.matrixWorld),X.setFromMatrixPosition(ae.matrixWorld);const Te=oe.distanceTo(X),Re=ne.projectionMatrix.elements,de=ae.projectionMatrix.elements,Ke=Re[14]/(Re[10]-1),Xe=Re[14]/(Re[10]+1),Le=(Re[9]+1)/Re[5],at=(Re[9]-1)/Re[5],St=(Re[8]-1)/Re[0],wt=(de[8]+1)/de[0],et=Ke*St,bt=Ke*wt,ht=Te/(-St+wt),ut=ht*-St;if(ne.matrixWorld.decompose(q.position,q.quaternion,q.scale),q.translateX(ut),q.translateZ(ht),q.matrixWorld.compose(q.position,q.quaternion,q.scale),q.matrixWorldInverse.copy(q.matrixWorld).invert(),Re[10]===-1)q.projectionMatrix.copy(ne.projectionMatrix),q.projectionMatrixInverse.copy(ne.projectionMatrixInverse);else{const P=Ke+ht,At=Xe+ht,qe=et-ut,nt=bt+(Te-ut),S=Le*Xe/At*P,m=at*Xe/At*P;q.projectionMatrix.makePerspective(qe,nt,S,m,P,At),q.projectionMatrixInverse.copy(q.projectionMatrix).invert()}}function $(q,ne){ne===null?q.matrixWorld.copy(q.matrix):q.matrixWorld.multiplyMatrices(ne.matrixWorld,q.matrix),q.matrixWorldInverse.copy(q.matrixWorld).invert()}this.updateCamera=function(q){if(i===null)return;let ne=q.near,ae=q.far;y.texture!==null&&(y.depthNear>0&&(ne=y.depthNear),y.depthFar>0&&(ae=y.depthFar)),O.near=G.near=E.near=ne,O.far=G.far=E.far=ae,(Y!==O.near||D!==O.far)&&(i.updateRenderState({depthNear:O.near,depthFar:O.far}),Y=O.near,D=O.far),O.layers.mask=q.layers.mask|6,E.layers.mask=O.layers.mask&-5,G.layers.mask=O.layers.mask&-3;const Te=q.parent,Re=O.cameras;$(O,Te);for(let de=0;de<Re.length;de++)$(Re[de],Te);Re.length===2?K(O,E,G):O.projectionMatrix.copy(E.projectionMatrix),_===null&&q.isPerspectiveCamera&&(_={camera:q,fov:q.fov,zoom:q.zoom}),Ne(q,O,Te)};function Ne(q,ne,ae){ae===null?q.matrix.copy(ne.matrixWorld):(q.matrix.copy(ae.matrixWorld),q.matrix.invert(),q.matrix.multiply(ne.matrixWorld)),q.matrix.decompose(q.position,q.quaternion,q.scale),q.updateMatrixWorld(!0),q.projectionMatrix.copy(ne.projectionMatrix),q.projectionMatrixInverse.copy(ne.projectionMatrixInverse),q.isPerspectiveCamera&&(q.fov=Mi*2*Math.atan(1/q.projectionMatrix.elements[5]),q.zoom=1)}this.getCamera=function(){return O},this.getFoveation=function(){if(!(f===null&&h===null))return o},this.setFoveation=function(q){o=q,f!==null&&(f.fixedFoveation=q),h!==null&&h.fixedFoveation!==void 0&&(h.fixedFoveation=q)},this.hasDepthSensing=function(){return y.texture!==null},this.getDepthSensingMesh=function(){return y.getMesh(O)},this.getCameraTexture=function(q){return g[q]};let ye=null;function je(q,ne){if(l=ne.getViewerPose(c||s),p=ne,l!==null){const ae=l.views;h!==null&&(e.setRenderTargetFramebuffer(I,h.framebuffer),e.setRenderTarget(I));let Te=!1;ae.length!==O.cameras.length&&(O.cameras.length=0,Te=!0);for(let de=0;de<ae.length;de++){const Ke=ae[de];let Xe=null;if(h!==null)Xe=h.getViewport(Ke);else{const at=u.getViewSubImage(f,Ke);Xe=at.viewport,de===0&&(e.setRenderTargetTextures(I,at.colorTexture,at.depthStencilTexture),e.setRenderTarget(I))}let Le=U[de];Le===void 0&&(Le=new Nt,Le.layers.enable(de),Le.viewport=new rt,U[de]=Le),Le.matrix.fromArray(Ke.transform.matrix),Le.matrix.decompose(Le.position,Le.quaternion,Le.scale),Le.projectionMatrix.fromArray(Ke.projectionMatrix),Le.projectionMatrixInverse.copy(Le.projectionMatrix).invert(),Le.viewport.set(Xe.x,Xe.y,Xe.width,Xe.height),de===0&&(O.matrix.copy(Le.matrix),O.matrix.decompose(O.position,O.quaternion,O.scale)),Te===!0&&O.cameras.push(Le)}const Re=i.enabledFeatures;if(Re&&Re.includes("depth-sensing")&&i.depthUsage=="gpu-optimized"&&M){u=n.getBinding();const de=u.getDepthInformation(ae[0]);de&&de.isValid&&de.texture&&y.init(de,i.renderState)}if(Re&&Re.includes("camera-access")&&M){e.state.unbindTexture(),u=n.getBinding();for(let de=0;de<ae.length;de++){const Ke=ae[de].camera;if(Ke){let Xe=g[Ke];Xe||(Xe=new to,g[Ke]=Xe);const Le=u.getCameraImage(Ke);Xe.sourceTexture=Le}}}}for(let ae=0;ae<x.length;ae++){const Te=T[ae],Re=x[ae];Te!==null&&Re!==void 0&&Re.update(Te,ne,c||s)}ye&&ye(q,ne),ne.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ne}),p=null}const Ue=new mo;Ue.setAnimationLoop(je),this.setAnimationLoop=function(q){ye=q},this.dispose=function(){}}},pd=new Qe,yo=new Ie;yo.set(-1,0,0,0,1,0,0,0,1);function md(e,t){function n(g,d){g.matrixAutoUpdate===!0&&g.updateMatrix(),d.value.copy(g.matrix)}function i(g,d){d.color.getRGB(g.fogColor.value,co(e)),d.isFog?(g.fogNear.value=d.near,g.fogFar.value=d.far):d.isFogExp2&&(g.fogDensity.value=d.density)}function r(g,d,A,I,x){d.isNodeMaterial?d.uniformsNeedUpdate=!1:d.isMeshBasicMaterial?s(g,d):d.isMeshLambertMaterial?(s(g,d),d.envMap&&(g.envMapIntensity.value=d.envMapIntensity)):d.isMeshToonMaterial?(s(g,d),f(g,d)):d.isMeshPhongMaterial?(s(g,d),u(g,d),d.envMap&&(g.envMapIntensity.value=d.envMapIntensity)):d.isMeshStandardMaterial?(s(g,d),h(g,d),d.isMeshPhysicalMaterial&&p(g,d,x)):d.isMeshMatcapMaterial?(s(g,d),M(g,d)):d.isMeshDepthMaterial?s(g,d):d.isMeshDistanceMaterial?(s(g,d),y(g,d)):d.isMeshNormalMaterial?s(g,d):d.isLineBasicMaterial?(a(g,d),d.isLineDashedMaterial&&o(g,d)):d.isPointsMaterial?c(g,d,A,I):d.isSpriteMaterial?l(g,d):d.isShadowMaterial?(g.color.value.copy(d.color),g.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function s(g,d){g.opacity.value=d.opacity,d.color&&g.diffuse.value.copy(d.color),d.emissive&&g.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(g.map.value=d.map,n(d.map,g.mapTransform)),d.alphaMap&&(g.alphaMap.value=d.alphaMap,n(d.alphaMap,g.alphaMapTransform)),d.bumpMap&&(g.bumpMap.value=d.bumpMap,n(d.bumpMap,g.bumpMapTransform),g.bumpScale.value=d.bumpScale,d.side===1&&(g.bumpScale.value*=-1)),d.normalMap&&(g.normalMap.value=d.normalMap,n(d.normalMap,g.normalMapTransform),g.normalScale.value.copy(d.normalScale),d.side===1&&g.normalScale.value.negate()),d.displacementMap&&(g.displacementMap.value=d.displacementMap,n(d.displacementMap,g.displacementMapTransform),g.displacementScale.value=d.displacementScale,g.displacementBias.value=d.displacementBias),d.emissiveMap&&(g.emissiveMap.value=d.emissiveMap,n(d.emissiveMap,g.emissiveMapTransform)),d.specularMap&&(g.specularMap.value=d.specularMap,n(d.specularMap,g.specularMapTransform)),d.alphaTest>0&&(g.alphaTest.value=d.alphaTest);const A=t.get(d),I=A.envMap,x=A.envMapRotation;I&&(g.envMap.value=I,g.envMapRotation.value.setFromMatrix4(pd.makeRotationFromEuler(x)).transpose(),I.isCubeTexture&&I.isRenderTargetTexture===!1&&g.envMapRotation.value.premultiply(yo),g.reflectivity.value=d.reflectivity,g.ior.value=d.ior,g.refractionRatio.value=d.refractionRatio),d.lightMap&&(g.lightMap.value=d.lightMap,g.lightMapIntensity.value=d.lightMapIntensity,n(d.lightMap,g.lightMapTransform)),d.aoMap&&(g.aoMap.value=d.aoMap,g.aoMapIntensity.value=d.aoMapIntensity,n(d.aoMap,g.aoMapTransform))}function a(g,d){g.diffuse.value.copy(d.color),g.opacity.value=d.opacity,d.map&&(g.map.value=d.map,n(d.map,g.mapTransform))}function o(g,d){g.dashSize.value=d.dashSize,g.totalSize.value=d.dashSize+d.gapSize,g.scale.value=d.scale}function c(g,d,A,I){g.diffuse.value.copy(d.color),g.opacity.value=d.opacity,g.size.value=d.size*A,g.scale.value=I*.5,d.map&&(g.map.value=d.map,n(d.map,g.uvTransform)),d.alphaMap&&(g.alphaMap.value=d.alphaMap,n(d.alphaMap,g.alphaMapTransform)),d.alphaTest>0&&(g.alphaTest.value=d.alphaTest)}function l(g,d){g.diffuse.value.copy(d.color),g.opacity.value=d.opacity,g.rotation.value=d.rotation,d.map&&(g.map.value=d.map,n(d.map,g.mapTransform)),d.alphaMap&&(g.alphaMap.value=d.alphaMap,n(d.alphaMap,g.alphaMapTransform)),d.alphaTest>0&&(g.alphaTest.value=d.alphaTest)}function u(g,d){g.specular.value.copy(d.specular),g.shininess.value=Math.max(d.shininess,1e-4)}function f(g,d){d.gradientMap&&(g.gradientMap.value=d.gradientMap)}function h(g,d){g.metalness.value=d.metalness,d.metalnessMap&&(g.metalnessMap.value=d.metalnessMap,n(d.metalnessMap,g.metalnessMapTransform)),g.roughness.value=d.roughness,d.roughnessMap&&(g.roughnessMap.value=d.roughnessMap,n(d.roughnessMap,g.roughnessMapTransform)),d.envMap&&(g.envMapIntensity.value=d.envMapIntensity)}function p(g,d,A){g.ior.value=d.ior,d.sheen>0&&(g.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),g.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(g.sheenColorMap.value=d.sheenColorMap,n(d.sheenColorMap,g.sheenColorMapTransform)),d.sheenRoughnessMap&&(g.sheenRoughnessMap.value=d.sheenRoughnessMap,n(d.sheenRoughnessMap,g.sheenRoughnessMapTransform))),d.clearcoat>0&&(g.clearcoat.value=d.clearcoat,g.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(g.clearcoatMap.value=d.clearcoatMap,n(d.clearcoatMap,g.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,n(d.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(g.clearcoatNormalMap.value=d.clearcoatNormalMap,n(d.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===1&&g.clearcoatNormalScale.value.negate())),d.dispersion>0&&(g.dispersion.value=d.dispersion),d.retroreflectivity>0&&(g.retroreflectivity.value=d.retroreflectivity),d.iridescence>0&&(g.iridescence.value=d.iridescence,g.iridescenceIOR.value=d.iridescenceIOR,g.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(g.iridescenceMap.value=d.iridescenceMap,n(d.iridescenceMap,g.iridescenceMapTransform)),d.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=d.iridescenceThicknessMap,n(d.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),d.transmission>0&&(g.transmission.value=d.transmission,g.transmissionSamplerMap.value=A.texture,g.transmissionSamplerSize.value.set(A.width,A.height),d.transmissionMap&&(g.transmissionMap.value=d.transmissionMap,n(d.transmissionMap,g.transmissionMapTransform)),g.thickness.value=d.thickness,d.thicknessMap&&(g.thicknessMap.value=d.thicknessMap,n(d.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=d.attenuationDistance,g.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(g.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(g.anisotropyMap.value=d.anisotropyMap,n(d.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=d.specularIntensity,g.specularColor.value.copy(d.specularColor),d.specularColorMap&&(g.specularColorMap.value=d.specularColorMap,n(d.specularColorMap,g.specularColorMapTransform)),d.specularIntensityMap&&(g.specularIntensityMap.value=d.specularIntensityMap,n(d.specularIntensityMap,g.specularIntensityMapTransform))}function M(g,d){d.matcap&&(g.matcap.value=d.matcap)}function y(g,d){const A=t.get(d).light;g.referencePosition.value.setFromMatrixPosition(A.matrixWorld),g.nearDistance.value=A.shadow.camera.near,g.farDistance.value=A.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:r}}function gd(e,t,n,i){let r={},s={},a=[];const o=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function c(x,T){const b=T.program;i.uniformBlockBinding(x,b)}function l(x,T){let b=r[x.id];b===void 0&&(g(x),b=u(x),r[x.id]=b,x.addEventListener("dispose",A));const w=T.program;i.updateUBOMapping(x,w);const _=t.render.frame;s[x.id]!==_&&(h(x),s[x.id]=_)}function u(x){const T=f();x.__bindingPointIndex=T;const b=e.createBuffer(),w=x.__size,_=x.usage;return e.bindBuffer(e.UNIFORM_BUFFER,b),e.bufferData(e.UNIFORM_BUFFER,w,_),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,T,b),b}function f(){for(let x=0;x<o;x++)if(a.indexOf(x)===-1)return a.push(x),x;return Ce("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(x){const T=r[x.id],b=x.uniforms,w=x.__cache;e.bindBuffer(e.UNIFORM_BUFFER,T);for(let _=0,E=b.length;_<E;_++){const G=b[_];if(Array.isArray(G))for(let U=0,O=G.length;U<O;U++)p(G[U],_,U,w);else p(G,_,0,w)}e.bindBuffer(e.UNIFORM_BUFFER,null)}function p(x,T,b,w){if(y(x,T,b,w)===!0){const _=x.__offset,E=x.value;if(Array.isArray(E)){let G=0;for(let U=0;U<E.length;U++){const O=E[U],Y=d(O);M(O,x.__data,G),typeof O!="number"&&typeof O!="boolean"&&!O.isMatrix3&&!ArrayBuffer.isView(O)&&(G+=Y.storage/Float32Array.BYTES_PER_ELEMENT)}}else M(E,x.__data,0);e.bufferSubData(e.UNIFORM_BUFFER,_,x.__data)}}function M(x,T,b){typeof x=="number"||typeof x=="boolean"?T[0]=x:x.isMatrix3?(T[0]=x.elements[0],T[1]=x.elements[1],T[2]=x.elements[2],T[3]=0,T[4]=x.elements[3],T[5]=x.elements[4],T[6]=x.elements[5],T[7]=0,T[8]=x.elements[6],T[9]=x.elements[7],T[10]=x.elements[8],T[11]=0):ArrayBuffer.isView(x)?T.set(new x.constructor(x.buffer,x.byteOffset,T.length)):x.toArray(T,b)}function y(x,T,b,w){const _=x.value,E=T+"_"+b;if(w[E]===void 0)return typeof _=="number"||typeof _=="boolean"?w[E]=_:ArrayBuffer.isView(_)?w[E]=_.slice():w[E]=_.clone(),!0;{const G=w[E];if(typeof _=="number"||typeof _=="boolean"){if(G!==_)return w[E]=_,!0}else{if(ArrayBuffer.isView(_))return!0;if(G.equals(_)===!1)return G.copy(_),!0}}return!1}function g(x){const T=x.uniforms;let b=0;const w=16;for(let E=0,G=T.length;E<G;E++){const U=Array.isArray(T[E])?T[E]:[T[E]];for(let O=0,Y=U.length;O<Y;O++){const D=U[O],V=Array.isArray(D.value)?D.value:[D.value];for(let J=0,H=V.length;J<H;J++){const oe=V[J],X=d(oe),K=b%w,$=K%X.boundary,Ne=K+$;b+=$,Ne!==0&&w-Ne<X.storage&&(b+=w-Ne),D.__data=new Float32Array(X.storage/Float32Array.BYTES_PER_ELEMENT),D.__offset=b,b+=X.storage}}}const _=b%w;return _>0&&(b+=w-_),x.__size=b,x.__cache={},this}function d(x){const T={boundary:0,storage:0};return typeof x=="number"||typeof x=="boolean"?(T.boundary=4,T.storage=4):x.isVector2?(T.boundary=8,T.storage=8):x.isVector3||x.isColor?(T.boundary=16,T.storage=12):x.isVector4?(T.boundary=16,T.storage=16):x.isMatrix3?(T.boundary=48,T.storage=48):x.isMatrix4?(T.boundary=64,T.storage=64):x.isTexture?be("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(x)?(T.boundary=16,T.storage=x.byteLength):be("WebGLRenderer: Unsupported uniform value type.",x),T}function A(x){const T=x.target;T.removeEventListener("dispose",A);const b=a.indexOf(T.__bindingPointIndex);a.splice(b,1),e.deleteBuffer(r[T.id]),delete r[T.id],delete s[T.id]}function I(){for(const x in r)e.deleteBuffer(r[x]);a=[],r={},s={}}return{bind:c,update:l,dispose:I}}var _d=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Xt=null;function vd(){return Xt===null&&(Xt=new Qa(_d,16,16,ir,pn),Xt.name="DFG_LUT",Xt.minFilter=Lt,Xt.magFilter=Lt,Xt.wrapS=nn,Xt.wrapT=nn,Xt.generateMipmaps=!1,Xt.needsUpdate=!0),Xt}var Pd=class{constructor(e={}){const{canvas:t=bl(),context:n=null,depth:i=!0,stencil:r=!1,alpha:s=!1,antialias:a=!1,premultipliedAlpha:o=!0,preserveDrawingBuffer:c=!1,powerPreference:l="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:f=!1,outputBufferType:h=fn}=e;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=n.getContextAttributes().alpha}else p=s;const M=h,y=new Set([Va,za,Ba]),g=new Set([fn,yn,Ia,Na,Da,Ua]),d=new Uint32Array(4),A=new Int32Array(4),I=new B;let x=null,T=null;const b=[],w=[];let _=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const E=this;let G=!1,U=null,O=null,Y=null,D=null;this._outputColorSpace=zt;let V=0,J=0,H=null,oe=-1,X=null;const K=new rt,$=new rt;let Ne=null;const ye=new De(0);let je=0,Ue=t.width,q=t.height,ne=1,ae=null,Te=null;const Re=new rt(0,0,Ue,q),de=new rt(0,0,Ue,q);let Ke=!1;const Xe=new rs;let Le=!1,at=!1;const St=new Qe,wt=new B,et=new rt,bt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let ht=!1;function ut(){return H===null?ne:1}let P=n;function At(v,C){return t.getContext(v,C)}let qe,nt,S,m,R,k,Q,re,le,N,ie,pe,ve,te,_e,Ee,Pe,He,L,Z,j,fe,Me;try{const v={alpha:!0,depth:i,stencil:r,antialias:a,premultipliedAlpha:o,preserveDrawingBuffer:c,powerPreference:l,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine","three.js r186"),t.addEventListener("webglcontextlost",we,!1),t.addEventListener("webglcontextrestored",dt,!1),t.addEventListener("webglcontextcreationerror",Ye,!1),P===null){const C="webgl2";if(P=At(C,v),P===null)throw At(C)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}ee()}catch(v){throw t.removeEventListener("webglcontextlost",we,!1),t.removeEventListener("webglcontextrestored",dt,!1),t.removeEventListener("webglcontextcreationerror",Ye,!1),Ce("WebGLRenderer: "+v.message),v}function ee(){qe=new vh(P),qe.init(),j=new cd(P,qe),nt=new lh(P,qe,e,j),S=new od(P,qe),nt.reversedDepthBuffer&&f&&S.buffers.depth.setReversed(!0),O=P.createFramebuffer(),Y=P.createFramebuffer(),D=P.createFramebuffer(),m=new xh(P),R=new Yu,k=new ld(P,qe,S,R,nt,j,m),Q=new _h(E),re=new ih(P),fe=new ah(P,re),le=new Mh(P,re,m,fe),N=new Eh(P,le,re,fe,m),He=new yh(P,nt,k),_e=new ch(R),ie=new qu(E,Q,qe,nt,fe,_e),pe=new md(E,R),ve=new Zu,te=new td(qe),Pe=new sh(E,Q,S,N,p,o),Ee=new ad(E,N,nt),Me=new gd(P,m,nt,S),L=new oh(P,qe,m),Z=new Sh(P,qe,m),m.programs=ie.programs,E.capabilities=nt,E.extensions=qe,E.properties=R,E.renderLists=ve,E.shadowMap=Ee,E.state=S,E.info=m}M!==1009&&(_=new bh(M,t.width,t.height,a,i,r));const ue=new fd(E,P);this.xr=ue,this.getContext=function(){return P},this.getContextAttributes=function(){return P.getContextAttributes()},this.forceContextLoss=function(){const v=qe.get("WEBGL_lose_context");v&&v.loseContext()},this.forceContextRestore=function(){const v=qe.get("WEBGL_lose_context");v&&v.restoreContext()},this.getPixelRatio=function(){return ne},this.setPixelRatio=function(v){v!==void 0&&(ne=v,this.setSize(Ue,q,!1))},this.getSize=function(v){return v.set(Ue,q)},this.setSize=function(v,C,W=!0){if(ue.isPresenting){be("WebGLRenderer: Can't change size while VR device is presenting.");return}Ue=v,q=C,t.width=Math.floor(v*ne),t.height=Math.floor(C*ne),W===!0&&(t.style.width=v+"px",t.style.height=C+"px"),_!==null&&_.setSize(t.width,t.height),this.setViewport(0,0,v,C)},this.getDrawingBufferSize=function(v){return v.set(Ue*ne,q*ne).floor()},this.setDrawingBufferSize=function(v,C,W){Ue=v,q=C,ne=W,t.width=Math.floor(v*W),t.height=Math.floor(C*W),this.setViewport(0,0,v,C)},this.setEffects=function(v){if(M===1009){Ce("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(v){for(let C=0;C<v.length;C++)if(v[C].isOutputPass===!0){be("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}_.setEffects(v||[])},this.getCurrentViewport=function(v){return v.copy(K)},this.getViewport=function(v){return v.copy(Re)},this.setViewport=function(v,C,W,z){v.isVector4?Re.set(v.x,v.y,v.z,v.w):Re.set(v,C,W,z),S.viewport(K.copy(Re).multiplyScalar(ne).round())},this.getScissor=function(v){return v.copy(de)},this.setScissor=function(v,C,W,z){v.isVector4?de.set(v.x,v.y,v.z,v.w):de.set(v,C,W,z),S.scissor($.copy(de).multiplyScalar(ne).round())},this.getScissorTest=function(){return Ke},this.setScissorTest=function(v){S.setScissorTest(Ke=v)},this.setOpaqueSort=function(v){ae=v},this.setTransparentSort=function(v){Te=v},this.getClearColor=function(v){return v.copy(Pe.getClearColor())},this.setClearColor=function(){Pe.setClearColor(...arguments)},this.getClearAlpha=function(){return Pe.getClearAlpha()},this.setClearAlpha=function(){Pe.setClearAlpha(...arguments)},this.clear=function(v=!0,C=!0,W=!0){let z=0;if(v){let F=!1;if(H!==null){const se=H.texture.format;F=y.has(se)}if(F){const se=H.texture.type,he=g.has(se),me=Pe.getClearColor(),ge=Pe.getClearAlpha(),Ae=me.r,Fe=me.g,Ve=me.b;he?(d[0]=Ae,d[1]=Fe,d[2]=Ve,d[3]=ge,P.clearBufferuiv(P.COLOR,0,d)):(A[0]=Ae,A[1]=Fe,A[2]=Ve,A[3]=ge,P.clearBufferiv(P.COLOR,0,A))}else z|=P.COLOR_BUFFER_BIT}C&&(z|=P.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),W&&(z|=P.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),z!==0&&P.clear(z)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(v){v.setRenderer(this),U=v},this.dispose=function(){t.removeEventListener("webglcontextlost",we,!1),t.removeEventListener("webglcontextrestored",dt,!1),t.removeEventListener("webglcontextcreationerror",Ye,!1),Pe.dispose(),ve.dispose(),te.dispose(),R.dispose(),Q.dispose(),N.dispose(),fe.dispose(),Me.dispose(),ie.dispose(),ue.dispose(),ue.removeEventListener("sessionstart",cs),ue.removeEventListener("sessionend",hs),gn.stop()};function we(v){v.preventDefault(),Es("WebGLRenderer: Context Lost."),G=!0}function dt(){Es("WebGLRenderer: Context Restored."),G=!1;const v=m.autoReset,C=Ee.enabled,W=Ee.autoUpdate,z=Ee.needsUpdate,F=Ee.type;ee(),m.autoReset=v,Ee.enabled=C,Ee.autoUpdate=W,Ee.needsUpdate=z,Ee.type=F}function Ye(v){Ce("WebGLRenderer: A WebGL context could not be created. Reason: ",v.statusMessage)}function Ht(v){const C=v.target;C.removeEventListener("dispose",Ht),Jt(C)}function Jt(v){Eo(v),R.remove(v)}function Eo(v){const C=R.get(v).programs;C!==void 0&&(C.forEach(function(W){ie.releaseProgram(W)}),v.isShaderMaterial&&ie.releaseShaderCache(v))}this.renderBufferDirect=function(v,C,W,z,F,se){C===null&&(C=bt);const he=F.isMesh&&F.matrixWorld.determinantAffine()<0,me=Ao(v,C,W,z,F);S.setMaterial(z,he);let ge=W.index,Ae=1;if(z.wireframe===!0){if(ge=le.getWireframeAttribute(W),ge===void 0)return;Ae=2}const Fe=W.drawRange,Ve=W.attributes.position;let xe=Fe.start*Ae,Ze=(Fe.start+Fe.count)*Ae;se!==null&&(xe=Math.max(xe,se.start*Ae),Ze=Math.min(Ze,(se.start+se.count)*Ae)),ge!==null?(xe=Math.max(xe,0),Ze=Math.min(Ze,ge.count)):Ve!=null&&(xe=Math.max(xe,0),Ze=Math.min(Ze,Ve.count));const ot=Ze-xe;if(ot<0||ot===1/0)return;fe.setup(F,z,me,W,ge);let tt,ke=L;if(ge!==null&&(tt=re.get(ge),ke=Z,ke.setIndex(tt)),F.isMesh)z.wireframe===!0?(S.setLineWidth(z.wireframeLinewidth*ut()),ke.setMode(P.LINES)):ke.setMode(P.TRIANGLES);else if(F.isLine){let _t=z.linewidth;_t===void 0&&(_t=1),S.setLineWidth(_t*ut()),F.isLineSegments?ke.setMode(P.LINES):F.isLineLoop?ke.setMode(P.LINE_LOOP):ke.setMode(P.LINE_STRIP)}else F.isPoints?ke.setMode(P.POINTS):F.isSprite&&ke.setMode(P.TRIANGLES);if(F.isBatchedMesh)if(qe.get("WEBGL_multi_draw"))ke.renderMultiDraw(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount);else{const _t=F._multiDrawStarts,Se=F._multiDrawCounts,Rt=F._multiDrawCount,We=ge?re.get(ge).bytesPerElement:1,Dt=R.get(z).currentProgram.getUniforms();for(let kt=0;kt<Rt;kt++)Dt.setValue(P,"_gl_DrawID",kt),ke.render(_t[kt]/We,Se[kt])}else if(F.isInstancedMesh)ke.renderInstances(xe,ot,F.count);else if(W.isInstancedBufferGeometry){const _t=W._maxInstanceCount!==void 0?W._maxInstanceCount:1/0,Se=Math.min(W.instanceCount,_t);ke.renderInstances(xe,ot,Se)}else ke.render(xe,ot)};function ls(v,C,W,z){U!==null&&v.isNodeMaterial&&U.setObject(z,v),Le===!0&&_e.setState(v,W,!1),v.transparent===!0&&v.side===2&&v.forceSinglePass===!1?(v.side=1,v.needsUpdate=!0,Ai(v,C,z),v.side=0,v.needsUpdate=!0,Ai(v,C,z),v.side=2):Ai(v,C,z)}this.compile=function(v,C,W=null){W===null&&(W=v),U!==null&&U.renderStart(v,C,W),T=te.get(W),T.init(C),w.push(T),W.traverseVisible(function(F){F.isLight&&F.layers.test(C.layers)&&(T.pushLight(F),F.castShadow&&T.pushShadow(F))}),v!==W&&v.traverseVisible(function(F){F.isLight&&F.layers.test(C.layers)&&(T.pushLight(F),F.castShadow&&T.pushShadow(F))}),T.setupLights(),U!==null&&U.updateLights(T.state.lightsArray),at=this.localClippingEnabled,Le=_e.init(this.clippingPlanes,at),Le===!0&&_e.setGlobalState(this.clippingPlanes,C),U!==null&&Ee.render(T.state.shadowsArray,W,C);const z=new Set;return v.traverse(function(F){if(!(F.isMesh||F.isPoints||F.isLine||F.isSprite))return;const se=F.material;if(se)if(Array.isArray(se))for(let he=0;he<se.length;he++){const me=se[he];ls(me,W,C,F),z.add(me)}else ls(se,W,C,F),z.add(se)}),T=w.pop(),U!==null&&U.renderEnd(),z},this.compileAsync=function(v,C,W=null){const z=this.compile(v,C,W);return new Promise(F=>{function se(){if(z.forEach(function(he){const me=R.get(he).currentProgram;(me===void 0||me.isReady())&&z.delete(he)}),z.size===0){F(v);return}setTimeout(se,10)}qe.get("KHR_parallel_shader_compile")!==null?se():setTimeout(se,10)})};let fr=null;function To(v){fr&&fr(v)}function cs(){gn.stop()}function hs(){gn.start()}const gn=new mo;gn.setAnimationLoop(To),typeof self<"u"&&gn.setContext(self),this.setAnimationLoop=function(v){fr=v,ue.setAnimationLoop(v),v===null?gn.stop():gn.start()},ue.addEventListener("sessionstart",cs),ue.addEventListener("sessionend",hs),this.render=function(v,C){if(C!==void 0&&C.isCamera!==!0){Ce("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(G===!0)return;U!==null&&U.renderStart(v,C);const W=ue.enabled===!0&&ue.isPresenting===!0,z=_!==null&&(H===null||W)&&_.begin(E,H);if(v.matrixWorldAutoUpdate===!0&&v.updateMatrixWorld(),C.parent===null&&C.matrixWorldAutoUpdate===!0&&C.updateMatrixWorld(),ue.enabled===!0&&ue.isPresenting===!0&&(_===null||_.isCompositing()===!1)&&(ue.cameraAutoUpdate===!0&&ue.updateCamera(C),C=ue.getCamera()),v.isScene===!0&&v.onBeforeRender(E,v,C,H),T=te.get(v,w.length),T.init(C),T.state.textureUnits=k.getTextureUnits(),w.push(T),St.multiplyMatrices(C.projectionMatrix,C.matrixWorldInverse),Xe.setFromProjectionMatrix(St,Qn,C.reversedDepth),at=this.localClippingEnabled,Le=_e.init(this.clippingPlanes,at),x=ve.get(v,b.length),x.init(),b.push(x),ue.enabled===!0&&ue.isPresenting===!0){const se=E.xr.getDepthSensingMesh();se!==null&&pr(se,C,-1/0,E.sortObjects)}pr(v,C,0,E.sortObjects),x.finish(),U!==null&&U.updateLights(T.state.lightsArray),E.sortObjects===!0&&x.sort(ae,Te),ht=ue.enabled===!1||ue.isPresenting===!1||ue.hasDepthSensing()===!1,ht&&Pe.addToRenderList(x,v),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),Le===!0&&_e.beginShadows();const F=T.state.shadowsArray;if(Ee.render(F,v,C),Le===!0&&_e.endShadows(),(z&&_.hasRenderPass())===!1){const se=x.opaque,he=x.transmissive;if(T.setupLights(),C.isArrayCamera){const me=C.cameras;if(he.length>0)for(let ge=0,Ae=me.length;ge<Ae;ge++){const Fe=me[ge];ds(se,he,v,Fe)}ht&&Pe.render(v);for(let ge=0,Ae=me.length;ge<Ae;ge++){const Fe=me[ge];us(x,v,Fe,Fe.viewport)}}else he.length>0&&ds(se,he,v,C),ht&&Pe.render(v),us(x,v,C)}H!==null&&J===0&&(k.updateMultisampleRenderTarget(H),k.updateRenderTargetMipmap(H)),z&&_.end(E),v.isScene===!0&&v.onAfterRender(E,v,C),fe.resetDefaultState(),oe=-1,X=null,w.pop(),w.length>0?(T=w[w.length-1],k.setTextureUnits(T.state.textureUnits),Le===!0&&_e.setGlobalState(E.clippingPlanes,T.state.camera)):T=null,b.pop(),b.length>0?x=b[b.length-1]:x=null,U!==null&&U.renderEnd()};function pr(v,C,W,z){if(v.visible===!1)return;if(v.layers.test(C.layers)){if(v.isGroup)W=v.renderOrder;else if(v.isLOD)v.autoUpdate===!0&&v.update(C);else if(v.isLightProbeGrid)T.pushLightProbeGrid(v);else if(v.isLight)T.pushLight(v),v.castShadow&&T.pushShadow(v);else if(v.isSprite){if(!v.frustumCulled||v.intersectsFrustum(Xe)){z&&et.setFromMatrixPosition(v.matrixWorld).applyMatrix4(St);const se=N.update(v),he=v.material;he.visible&&x.push(v,se,he,W,et.z,null,C)}}else if((v.isMesh||v.isLine||v.isPoints)&&(!v.frustumCulled||v.intersectsFrustum(Xe))){const se=N.update(v),he=v.material;if(z&&(v.boundingSphere!==void 0?(v.boundingSphere===null&&v.computeBoundingSphere(),et.copy(v.boundingSphere.center)):(se.boundingSphere===null&&se.computeBoundingSphere(),et.copy(se.boundingSphere.center)),et.applyMatrix4(v.matrixWorld).applyMatrix4(St)),Array.isArray(he)){const me=se.groups;for(let ge=0,Ae=me.length;ge<Ae;ge++){const Fe=me[ge],Ve=he[Fe.materialIndex];Ve&&Ve.visible&&x.push(v,se,Ve,W,et.z,Fe,C)}}else he.visible&&x.push(v,se,he,W,et.z,null,C)}}const F=v.children;for(let se=0,he=F.length;se<he;se++)pr(F[se],C,W,z)}function us(v,C,W,z){const{opaque:F,transmissive:se,transparent:he}=v;T.setupLightsView(W),Le===!0&&_e.setGlobalState(E.clippingPlanes,W),z&&S.viewport(K.copy(z)),F.length>0&&bi(F,C,W),se.length>0&&bi(se,C,W),he.length>0&&bi(he,C,W),S.buffers.depth.setTest(!0),S.buffers.depth.setMask(!0),S.buffers.color.setMask(!0),S.setPolygonOffset(!1)}function ds(v,C,W,z){if((W.isScene===!0?W.overrideMaterial:null)!==null)return;if(T.state.transmissionRenderTarget[z.id]===void 0){const Ve=qe.has("EXT_color_buffer_half_float")||qe.has("EXT_color_buffer_float");T.state.transmissionRenderTarget[z.id]=new Vt(1,1,{generateMipmaps:!0,type:Ve?pn:fn,minFilter:es,samples:Math.max(4,nt.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:Ge.workingColorSpace})}const F=T.state.transmissionRenderTarget[z.id],se=z.viewport||K;F.setSize(se.z*E.transmissionResolutionScale,se.w*E.transmissionResolutionScale);const he=E.getRenderTarget(),me=E.getActiveCubeFace(),ge=E.getActiveMipmapLevel();E.setRenderTarget(F),E.getClearColor(ye),je=E.getClearAlpha(),je<1&&E.setClearColor(16777215,.5),E.clear(),ht&&Pe.render(W);const Ae=E.toneMapping;E.toneMapping=0;const Fe=z.viewport;if(z.viewport!==void 0&&(z.viewport=void 0),T.setupLightsView(z),Le===!0&&_e.setGlobalState(E.clippingPlanes,z),bi(v,W,z),k.updateMultisampleRenderTarget(F),k.updateRenderTargetMipmap(F),qe.has("WEBGL_multisampled_render_to_texture")===!1){let Ve=!1;for(let xe=0,Ze=C.length;xe<Ze;xe++){const{object:ot,geometry:tt,material:ke,group:_t}=C[xe];if(ke.side===2&&ot.layers.test(z.layers)){const Se=ke.side;ke.side=1,ke.needsUpdate=!0,fs(ot,W,z,tt,ke,_t),ke.side=Se,ke.needsUpdate=!0,Ve=!0}}Ve===!0&&(k.updateMultisampleRenderTarget(F),k.updateRenderTargetMipmap(F))}E.setRenderTarget(he,me,ge),E.setClearColor(ye,je),Fe!==void 0&&(z.viewport=Fe),E.toneMapping=Ae}function bi(v,C,W){const z=C.isScene===!0?C.overrideMaterial:null;for(let F=0,se=v.length;F<se;F++){const he=v[F],{object:me,geometry:ge,group:Ae}=he;let Fe=he.material;Fe.allowOverride===!0&&z!==null&&(Fe=z),me.layers.test(W.layers)&&fs(me,C,W,ge,Fe,Ae)}}function fs(v,C,W,z,F,se){U!==null&&F.isNodeMaterial&&U.setObject(v,F),v.onBeforeRender(E,C,W,z,F,se),v.modelViewMatrix.multiplyMatrices(W.matrixWorldInverse,v.matrixWorld),v.normalMatrix.getNormalMatrix(v.modelViewMatrix),F.onBeforeRender(E,C,W,z,v,se),F.transparent===!0&&F.side===2&&F.forceSinglePass===!1?(F.side=1,F.needsUpdate=!0,E.renderBufferDirect(W,C,z,F,v,se),F.side=0,F.needsUpdate=!0,E.renderBufferDirect(W,C,z,F,v,se),F.side=2):E.renderBufferDirect(W,C,z,F,v,se),v.onAfterRender(E,C,W,z,F,se)}function Ai(v,C,W){C.isScene!==!0&&(C=bt);const z=R.get(v),F=T.state.lights,se=T.state.shadowsArray,he=F.state.version,me=ie.getParameters(v,F.state,se,C,W,T.state.lightProbeGridArray),ge=ie.getProgramCacheKey(me);let Ae=z.programs;z.environment=v.isMeshStandardMaterial||v.isMeshLambertMaterial||v.isMeshPhongMaterial?C.environment:null,z.fog=C.fog;const Fe=v.isMeshStandardMaterial||v.isMeshLambertMaterial&&!v.envMap||v.isMeshPhongMaterial&&!v.envMap;z.envMap=Q.get(v.envMap||z.environment,Fe),z.envMapRotation=z.environment!==null&&v.envMap===null?C.environmentRotation:v.envMapRotation,Ae===void 0&&(v.addEventListener("dispose",Ht),Ae=new Map,z.programs=Ae);let Ve=Ae.get(ge);if(Ve!==void 0){if(z.currentProgram===Ve&&z.lightsStateVersion===he)return ms(v,me),Ve}else me.uniforms=ie.getUniforms(v),U!==null&&v.isNodeMaterial&&U.build(v,W,me),v.onBeforeCompile(me,E),Ve=ie.acquireProgram(me,ge),Ae.set(ge,Ve),z.uniforms=me.uniforms;const xe=z.uniforms;return(!v.isShaderMaterial&&!v.isRawShaderMaterial||v.clipping===!0)&&(xe.clippingPlanes=_e.uniform),ms(v,me),z.needsLights=Ro(v),z.lightsStateVersion=he,z.needsLights&&(xe.ambientLightColor.value=F.state.ambient,xe.lightProbe.value=F.state.probe,xe.sunLights.value=F.state.sun,xe.sunLightShadows.value=F.state.sunShadow,xe.directionalLights.value=F.state.directional,xe.directionalLightShadows.value=F.state.directionalShadow,xe.spotLights.value=F.state.spot,xe.spotLightShadows.value=F.state.spotShadow,xe.rectAreaLights.value=F.state.rectArea,xe.ltc_1.value=F.state.rectAreaLTC1,xe.ltc_2.value=F.state.rectAreaLTC2,xe.pointLights.value=F.state.point,xe.pointLightShadows.value=F.state.pointShadow,xe.hemisphereLights.value=F.state.hemi,xe.sunShadowMatrix.value=F.state.sunShadowMatrix,xe.sunShadowCascade.value=F.state.sunShadowCascade,xe.directionalShadowMatrix.value=F.state.directionalShadowMatrix,xe.spotLightMatrix.value=F.state.spotLightMatrix,xe.spotLightMap.value=F.state.spotLightMap,xe.pointShadowMatrix.value=F.state.pointShadowMatrix),z.lightProbeGrid=T.state.lightProbeGridArray.length>0,z.currentProgram=Ve,z.uniformsList=null,Ve}function ps(v){if(v.uniformsList===null){const C=v.currentProgram.getUniforms();v.uniformsList=nr.seqWithValue(C.seq,v.uniforms)}return v.uniformsList}function ms(v,C){const W=R.get(v);W.outputColorSpace=C.outputColorSpace,W.batching=C.batching,W.batchingColor=C.batchingColor,W.instancing=C.instancing,W.instancingColor=C.instancingColor,W.instancingMorph=C.instancingMorph,W.skinning=C.skinning,W.morphTargets=C.morphTargets,W.morphNormals=C.morphNormals,W.morphColors=C.morphColors,W.morphTargetsCount=C.morphTargetsCount,W.numClippingPlanes=C.numClippingPlanes,W.numIntersection=C.numClipIntersection,W.vertexAlphas=C.vertexAlphas,W.vertexTangents=C.vertexTangents,W.toneMapping=C.toneMapping}function bo(v,C){if(v.length===0)return null;if(v.length===1)return v[0].texture!==null?v[0]:null;I.setFromMatrixPosition(C.matrixWorld);for(let W=0,z=v.length;W<z;W++){const F=v[W];if(F.texture!==null&&F.boundingBox.containsPoint(I))return F}return null}function Ao(v,C,W,z,F){C.isScene!==!0&&(C=bt),k.resetTextureUnits();const se=C.fog,he=z.isMeshStandardMaterial||z.isMeshLambertMaterial||z.isMeshPhongMaterial?C.environment:null,me=H===null?E.outputColorSpace:H.isXRRenderTarget===!0?H.texture.colorSpace:Ge.workingColorSpace,ge=z.isMeshStandardMaterial||z.isMeshLambertMaterial&&!z.envMap||z.isMeshPhongMaterial&&!z.envMap,Ae=Q.get(z.envMap||he,ge),Fe=z.vertexColors===!0&&!!W.attributes.color&&W.attributes.color.itemSize===4,Ve=!!W.attributes.tangent&&(!!z.normalMap||z.anisotropy>0),xe=!!W.morphAttributes.position,Ze=!!W.morphAttributes.normal,ot=!!W.morphAttributes.color;let tt=0;z.toneMapped&&(H===null||H.isXRRenderTarget===!0)&&(tt=E.toneMapping);const ke=W.morphAttributes.position||W.morphAttributes.normal||W.morphAttributes.color,_t=ke!==void 0?ke.length:0,Se=R.get(z),Rt=T.state.lights;if(Le===!0&&(at===!0||v!==X)){const $e=v===X&&z.id===oe;_e.setState(z,v,$e)}let We=!1;z.version===Se.__version?(Se.needsLights&&Se.lightsStateVersion!==Rt.state.version||Se.outputColorSpace!==me||F.isBatchedMesh&&Se.batching===!1||!F.isBatchedMesh&&Se.batching===!0||F.isBatchedMesh&&Se.batchingColor===!0&&F._colorsTexture===null||F.isBatchedMesh&&Se.batchingColor===!1&&F._colorsTexture!==null||F.isInstancedMesh&&Se.instancing===!1||!F.isInstancedMesh&&Se.instancing===!0||F.isSkinnedMesh&&Se.skinning===!1||!F.isSkinnedMesh&&Se.skinning===!0||F.isInstancedMesh&&Se.instancingColor===!0&&F.instanceColor===null||F.isInstancedMesh&&Se.instancingColor===!1&&F.instanceColor!==null||F.isInstancedMesh&&Se.instancingMorph===!0&&F.morphTexture===null||F.isInstancedMesh&&Se.instancingMorph===!1&&F.morphTexture!==null||Se.envMap!==Ae||z.fog===!0&&Se.fog!==se||Se.numClippingPlanes!==void 0&&(Se.numClippingPlanes!==_e.numPlanes||Se.numIntersection!==_e.numIntersection)||Se.vertexAlphas!==Fe||Se.vertexTangents!==Ve||Se.morphTargets!==xe||Se.morphNormals!==Ze||Se.morphColors!==ot||Se.toneMapping!==tt||Se.morphTargetsCount!==_t||!!Se.lightProbeGrid!=T.state.lightProbeGridArray.length>0)&&(We=!0):(We=!0,Se.__version=z.version);let Dt=Se.currentProgram;We===!0&&(Dt=Ai(z,C,F),U&&z.isNodeMaterial&&U.onUpdateProgram(z,Dt,Se));let kt=!1,sn=!1,Rn=!1;const Je=Dt.getUniforms(),lt=Se.uniforms;if(S.useProgram(Dt.program)&&(kt=!0,sn=!0,Rn=!0),z.id!==oe&&(oe=z.id,sn=!0),Se.needsLights){const $e=bo(T.state.lightProbeGridArray,F);Se.lightProbeGrid!==$e&&(Se.lightProbeGrid=$e,sn=!0)}if(kt||X!==v){S.buffers.depth.getReversed()&&v.reversedDepth!==!0&&(v._reversedDepth=!0,v.updateProjectionMatrix()),Je.setValue(P,"projectionMatrix",v.projectionMatrix),Je.setValue(P,"viewMatrix",v.matrixWorldInverse);const $e=Je.map.cameraPosition;$e!==void 0&&$e.setValue(P,wt.setFromMatrixPosition(v.matrixWorld)),nt.logarithmicDepthBuffer&&Je.setValue(P,"logDepthBufFC",2/(Math.log(v.far+1)/Math.LN2)),(z.isMeshPhongMaterial||z.isMeshToonMaterial||z.isMeshLambertMaterial||z.isMeshBasicMaterial||z.isMeshStandardMaterial||z.isShaderMaterial)&&Je.setValue(P,"isOrthographic",v.isOrthographicCamera===!0),X!==v&&(X=v,sn=!0,Rn=!0)}if(Se.needsLights&&(Rt.state.sunShadowMap.length>0&&Je.setValue(P,"sunShadowMap",Rt.state.sunShadowMap,k),Rt.state.directionalShadowMap.length>0&&Je.setValue(P,"directionalShadowMap",Rt.state.directionalShadowMap,k),Rt.state.spotShadowMap.length>0&&Je.setValue(P,"spotShadowMap",Rt.state.spotShadowMap,k),Rt.state.pointShadowMap.length>0&&Je.setValue(P,"pointShadowMap",Rt.state.pointShadowMap,k)),F.isSkinnedMesh){Je.setOptional(P,F,"bindMatrix"),Je.setOptional(P,F,"bindMatrixInverse");const $e=F.skeleton;$e&&($e.boneTexture===null&&$e.computeBoneTexture(),Je.setValue(P,"boneTexture",$e.boneTexture,k))}F.isBatchedMesh&&(Je.setOptional(P,F,"batchingTexture"),Je.setValue(P,"batchingTexture",F._matricesTexture,k),Je.setOptional(P,F,"batchingIdTexture"),Je.setValue(P,"batchingIdTexture",F._indirectTexture,k),Je.setOptional(P,F,"batchingColorTexture"),F._colorsTexture!==null&&Je.setValue(P,"batchingColorTexture",F._colorsTexture,k));const an=W.morphAttributes;if((an.position!==void 0||an.normal!==void 0||an.color!==void 0)&&He.update(F,W,Dt),(sn||Se.receiveShadow!==F.receiveShadow)&&(Se.receiveShadow=F.receiveShadow,Je.setValue(P,"receiveShadow",F.receiveShadow)),(z.isMeshStandardMaterial||z.isMeshLambertMaterial||z.isMeshPhongMaterial)&&z.envMap===null&&C.environment!==null&&(lt.envMapIntensity.value=C.environmentIntensity),lt.dfgLUT!==void 0&&(lt.dfgLUT.value=vd()),sn){if(Je.setValue(P,"toneMappingExposure",E.toneMappingExposure),Se.needsLights&&wo(lt,Rn),se&&z.fog===!0&&pe.refreshFogUniforms(lt,se),pe.refreshMaterialUniforms(lt,z,ne,q,T.state.transmissionRenderTarget[v.id]),Se.needsLights&&Se.lightProbeGrid){const $e=Se.lightProbeGrid;lt.probesSH.value=$e.texture,lt.probesMin.value.copy($e.boundingBox.min),lt.probesMax.value.copy($e.boundingBox.max),lt.probesResolution.value.copy($e.resolution)}nr.upload(P,ps(Se),lt,k)}if(z.isShaderMaterial&&z.uniformsNeedUpdate===!0&&(nr.upload(P,ps(Se),lt,k),z.uniformsNeedUpdate=!1),z.isSpriteMaterial&&Je.setValue(P,"center",F.center),Je.setValue(P,"modelViewMatrix",F.modelViewMatrix),Je.setValue(P,"normalMatrix",F.normalMatrix),Je.setValue(P,"modelMatrix",F.matrixWorld),z.uniformsGroups!==void 0){const $e=z.uniformsGroups;for(let ii=0,Cn=$e.length;ii<Cn;ii++){const _s=$e[ii];Me.update(_s,Dt),Me.bind(_s,Dt)}}return Dt}function wo(v,C){v.ambientLightColor.needsUpdate=C,v.lightProbe.needsUpdate=C,v.sunLights.needsUpdate=C,v.sunLightShadows.needsUpdate=C,v.directionalLights.needsUpdate=C,v.directionalLightShadows.needsUpdate=C,v.pointLights.needsUpdate=C,v.pointLightShadows.needsUpdate=C,v.spotLights.needsUpdate=C,v.spotLightShadows.needsUpdate=C,v.rectAreaLights.needsUpdate=C,v.hemisphereLights.needsUpdate=C}function Ro(v){return v.isMeshLambertMaterial||v.isMeshToonMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isShadowMaterial||v.isShaderMaterial&&v.lights===!0}this.getActiveCubeFace=function(){return V},this.getActiveMipmapLevel=function(){return J},this.getRenderTarget=function(){return H},this.setRenderTargetTextures=function(v,C,W){const z=R.get(v);z.__autoAllocateDepthBuffer=v.resolveDepthBuffer===!1,z.__autoAllocateDepthBuffer===!1&&(z.__useRenderToTexture=!1),R.get(v.texture).__webglTexture=C,R.get(v.depthTexture).__webglTexture=z.__autoAllocateDepthBuffer?void 0:W,z.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(v,C){const W=R.get(v);W.__webglFramebuffer=C,W.__useDefaultFramebuffer=C===void 0},this.setRenderTarget=function(v,C=0,W=0){H=v,V=C,J=W;let z=null,F=!1,se=!1;if(v){const he=R.get(v);if(he.__useDefaultFramebuffer!==void 0){S.bindFramebuffer(P.FRAMEBUFFER,he.__webglFramebuffer),K.copy(v.viewport),$.copy(v.scissor),Ne=v.scissorTest,S.viewport(K),S.scissor($),S.setScissorTest(Ne),oe=-1;return}else if(he.__webglFramebuffer===void 0)k.setupRenderTarget(v);else if(he.__hasExternalTextures)k.rebindTextures(v,R.get(v.texture).__webglTexture,R.get(v.depthTexture).__webglTexture);else if(v.depthBuffer){const Ae=v.depthTexture;if(he.__boundDepthTexture!==Ae){if(Ae!==null&&R.has(Ae)&&(v.width!==Ae.image.width||v.height!==Ae.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");k.setupDepthRenderbuffer(v)}}const me=v.texture;(me.isData3DTexture||me.isDataArrayTexture||me.isCompressedArrayTexture)&&(se=!0);const ge=R.get(v).__webglFramebuffer;v.isWebGLCubeRenderTarget?(Array.isArray(ge[C])?z=ge[C][W]:z=ge[C],F=!0):v.samples>0&&k.useMultisampledRTT(v)===!1?z=R.get(v).__webglMultisampledFramebuffer:Array.isArray(ge)?z=ge[W]:z=ge,K.copy(v.viewport),$.copy(v.scissor),Ne=v.scissorTest}else K.copy(Re).multiplyScalar(ne).floor(),$.copy(de).multiplyScalar(ne).floor(),Ne=Ke;if(W!==0&&(z=O),S.bindFramebuffer(P.FRAMEBUFFER,z)&&S.drawBuffers(v,z),S.viewport(K),S.scissor($),S.setScissorTest(Ne),F){const he=R.get(v.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_CUBE_MAP_POSITIVE_X+C,he.__webglTexture,W)}else if(se){const he=C;for(let me=0;me<v.textures.length;me++){const ge=R.get(v.textures[me]);P.framebufferTextureLayer(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0+me,ge.__webglTexture,W,he)}}else if(v!==null&&W!==0){const he=R.get(v.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,he.__webglTexture,W)}oe=-1};function gs(v){const C=R.get(v);return(C.__readFormat!==v.format||C.__readType!==v.type)&&(C.__readFormat=v.format,C.__readType=v.type,C.__formatReadable=nt.textureFormatReadable(v.format),C.__typeReadable=nt.textureTypeReadable(v.type)),C}this.readRenderTargetPixels=function(v,C,W,z,F,se,he,me=0){if(!(v&&v.isWebGLRenderTarget)){Ce("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let ge=R.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget&&he!==void 0&&(ge=ge[he]),ge){S.bindFramebuffer(P.FRAMEBUFFER,ge);try{const Ae=v.textures[me],Fe=Ae.format,Ve=Ae.type;v.textures.length>1&&P.readBuffer(P.COLOR_ATTACHMENT0+me);const xe=gs(Ae);if(xe.__formatReadable===!1){Ce("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(xe.__typeReadable===!1){Ce("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}C>=0&&C<=v.width-z&&W>=0&&W<=v.height-F&&P.readPixels(C,W,z,F,j.convert(Fe),j.convert(Ve),se)}finally{const Ae=H!==null?R.get(H).__webglFramebuffer:null;S.bindFramebuffer(P.FRAMEBUFFER,Ae)}}},this.readRenderTargetPixelsAsync=async function(v,C,W,z,F,se,he,me=0){if(!(v&&v.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let ge=R.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget&&he!==void 0&&(ge=ge[he]),ge)if(C>=0&&C<=v.width-z&&W>=0&&W<=v.height-F){S.bindFramebuffer(P.FRAMEBUFFER,ge);const Ae=v.textures[me],Fe=Ae.format,Ve=Ae.type;v.textures.length>1&&P.readBuffer(P.COLOR_ATTACHMENT0+me);const xe=gs(Ae);if(xe.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(xe.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const Ze=P.createBuffer();P.bindBuffer(P.PIXEL_PACK_BUFFER,Ze),P.bufferData(P.PIXEL_PACK_BUFFER,se.byteLength,P.STREAM_READ),P.readPixels(C,W,z,F,j.convert(Fe),j.convert(Ve),0),P.bindBuffer(P.PIXEL_PACK_BUFFER,null);const ot=H!==null?R.get(H).__webglFramebuffer:null;S.bindFramebuffer(P.FRAMEBUFFER,ot);const tt=P.fenceSync(P.SYNC_GPU_COMMANDS_COMPLETE,0);return P.flush(),await Al(P,tt,4),P.bindBuffer(P.PIXEL_PACK_BUFFER,Ze),P.getBufferSubData(P.PIXEL_PACK_BUFFER,0,se),P.bindBuffer(P.PIXEL_PACK_BUFFER,null),P.deleteBuffer(Ze),P.deleteSync(tt),se}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(v,C=null,W=0){const z=Math.pow(2,-W),F=Math.floor(v.image.width*z),se=Math.floor(v.image.height*z),he=C!==null?C.x:0,me=C!==null?C.y:0;k.setTexture2D(v,0),P.copyTexSubImage2D(P.TEXTURE_2D,W,0,0,he,me,F,se),S.unbindTexture()},this.copyTextureToTexture=function(v,C,W=null,z=null,F=0,se=0){let he,me,ge,Ae,Fe,Ve,xe,Ze,ot;const tt=v.isCompressedTexture?v.mipmaps[se]:v.image;if(W!==null)he=W.max.x-W.min.x,me=W.max.y-W.min.y,ge=W.isBox3?W.max.z-W.min.z:1,Ae=W.min.x,Fe=W.min.y,Ve=W.isBox3?W.min.z:0;else{const lt=Math.pow(2,-F);he=Math.floor(tt.width*lt),me=Math.floor(tt.height*lt),v.isDataArrayTexture?ge=tt.depth:v.isData3DTexture?ge=Math.floor(tt.depth*lt):ge=1,Ae=0,Fe=0,Ve=0}z!==null?(xe=z.x,Ze=z.y,ot=z.z):(xe=0,Ze=0,ot=0);const ke=j.convert(C.format),_t=j.convert(C.type);let Se;C.isData3DTexture?(k.setTexture3D(C,0),Se=P.TEXTURE_3D):C.isDataArrayTexture||C.isCompressedArrayTexture?(k.setTexture2DArray(C,0),Se=P.TEXTURE_2D_ARRAY):(k.setTexture2D(C,0),Se=P.TEXTURE_2D),S.activeTexture(P.TEXTURE0),S.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,C.flipY),S.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,C.premultiplyAlpha),S.pixelStorei(P.UNPACK_ALIGNMENT,C.unpackAlignment);const Rt=S.getParameter(P.UNPACK_ROW_LENGTH),We=S.getParameter(P.UNPACK_IMAGE_HEIGHT),Dt=S.getParameter(P.UNPACK_SKIP_PIXELS),kt=S.getParameter(P.UNPACK_SKIP_ROWS),sn=S.getParameter(P.UNPACK_SKIP_IMAGES);S.pixelStorei(P.UNPACK_ROW_LENGTH,tt.width),S.pixelStorei(P.UNPACK_IMAGE_HEIGHT,tt.height),S.pixelStorei(P.UNPACK_SKIP_PIXELS,Ae),S.pixelStorei(P.UNPACK_SKIP_ROWS,Fe),S.pixelStorei(P.UNPACK_SKIP_IMAGES,Ve);const Rn=v.isDataArrayTexture||v.isData3DTexture,Je=C.isDataArrayTexture||C.isData3DTexture;if(v.isDepthTexture){const lt=R.get(v),an=R.get(C),$e=R.get(lt.__renderTarget),ii=R.get(an.__renderTarget);S.bindFramebuffer(P.READ_FRAMEBUFFER,$e.__webglFramebuffer),S.bindFramebuffer(P.DRAW_FRAMEBUFFER,ii.__webglFramebuffer);for(let Cn=0;Cn<ge;Cn++)Rn&&(P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,R.get(v).__webglTexture,F,Ve+Cn),P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,R.get(C).__webglTexture,se,ot+Cn)),P.blitFramebuffer(Ae,Fe,he,me,xe,Ze,he,me,P.DEPTH_BUFFER_BIT,P.NEAREST);S.bindFramebuffer(P.READ_FRAMEBUFFER,null),S.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else if(F!==0||v.isRenderTargetTexture||R.has(v)){const lt=R.get(v),an=R.get(C);S.bindFramebuffer(P.READ_FRAMEBUFFER,Y),S.bindFramebuffer(P.DRAW_FRAMEBUFFER,D);for(let $e=0;$e<ge;$e++)Rn?P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,lt.__webglTexture,F,Ve+$e):P.framebufferTexture2D(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,lt.__webglTexture,F),Je?P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,an.__webglTexture,se,ot+$e):P.framebufferTexture2D(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,an.__webglTexture,se),F!==0?P.blitFramebuffer(Ae,Fe,he,me,xe,Ze,he,me,P.COLOR_BUFFER_BIT,P.NEAREST):Je?P.copyTexSubImage3D(Se,se,xe,Ze,ot+$e,Ae,Fe,he,me):P.copyTexSubImage2D(Se,se,xe,Ze,Ae,Fe,he,me);S.bindFramebuffer(P.READ_FRAMEBUFFER,null),S.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else Je?v.isDataTexture||v.isData3DTexture?P.texSubImage3D(Se,se,xe,Ze,ot,he,me,ge,ke,_t,tt.data):C.isCompressedArrayTexture?P.compressedTexSubImage3D(Se,se,xe,Ze,ot,he,me,ge,ke,tt.data):P.texSubImage3D(Se,se,xe,Ze,ot,he,me,ge,ke,_t,tt):v.isDataTexture?P.texSubImage2D(P.TEXTURE_2D,se,xe,Ze,he,me,ke,_t,tt.data):v.isCompressedTexture?P.compressedTexSubImage2D(P.TEXTURE_2D,se,xe,Ze,tt.width,tt.height,ke,tt.data):P.texSubImage2D(P.TEXTURE_2D,se,xe,Ze,he,me,ke,_t,tt);S.pixelStorei(P.UNPACK_ROW_LENGTH,Rt),S.pixelStorei(P.UNPACK_IMAGE_HEIGHT,We),S.pixelStorei(P.UNPACK_SKIP_PIXELS,Dt),S.pixelStorei(P.UNPACK_SKIP_ROWS,kt),S.pixelStorei(P.UNPACK_SKIP_IMAGES,sn),se===0&&C.generateMipmaps&&P.generateMipmap(Se),S.unbindTexture()},this.initRenderTarget=function(v){R.get(v).__webglFramebuffer===void 0&&k.setupRenderTarget(v)},this.initTexture=function(v){v.isCubeTexture?k.setTextureCube(v,0):v.isData3DTexture?k.setTexture3D(v,0):v.isDataArrayTexture||v.isCompressedArrayTexture?k.setTexture2DArray(v,0):k.setTexture2D(v,0),S.unbindTexture()},this.resetState=function(){V=0,J=0,H=null,S.reset(),fe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Qn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=Ge._getDrawingBufferColorSpace(e),t.unpackColorSpace=Ge._getUnpackColorSpace()}},Ld=class extends ic{constructor(){super(),this.name="RoomEnvironment",this.position.y=-3.5;const e=new hr;e.deleteAttribute("uv");const t=new $r({side:1}),n=new $r,i=new Gc(16777215,900,28,2);i.position.set(.418,16.199,.3),this.add(i);const r=new gt(e,t);r.position.set(-.757,13.219,.717),r.scale.set(31.713,28.305,28.591),this.add(r);const s=new dc(e,n,6),a=new Tt;a.position.set(-10.906,2.009,1.846),a.rotation.set(0,-.195,0),a.scale.set(2.328,7.905,4.651),a.updateMatrix(),s.setMatrixAt(0,a.matrix),a.position.set(-5.607,-.754,-.758),a.rotation.set(0,.994,0),a.scale.set(1.97,1.534,3.955),a.updateMatrix(),s.setMatrixAt(1,a.matrix),a.position.set(6.167,.857,7.803),a.rotation.set(0,.561,0),a.scale.set(3.927,6.285,3.687),a.updateMatrix(),s.setMatrixAt(2,a.matrix),a.position.set(-2.017,.018,6.124),a.rotation.set(0,.333,0),a.scale.set(2.002,4.566,2.064),a.updateMatrix(),s.setMatrixAt(3,a.matrix),a.position.set(2.291,-.756,-2.621),a.rotation.set(0,-.286,0),a.scale.set(1.546,1.552,1.496),a.updateMatrix(),s.setMatrixAt(4,a.matrix),a.position.set(-2.193,-.369,-5.547),a.rotation.set(0,.516,0),a.scale.set(3.875,3.487,2.986),a.updateMatrix(),s.setMatrixAt(5,a.matrix),this.add(s);const o=new gt(e,Xn(50));o.position.set(-16.116,14.37,8.208),o.scale.set(.1,2.428,2.739),this.add(o);const c=new gt(e,Xn(50));c.position.set(-16.109,18.021,-8.207),c.scale.set(.1,2.425,2.751),this.add(c);const l=new gt(e,Xn(17));l.position.set(14.904,12.198,-1.832),l.scale.set(.15,4.265,6.331),this.add(l);const u=new gt(e,Xn(43));u.position.set(-.462,8.89,14.52),u.scale.set(4.38,5.441,.088),this.add(u);const f=new gt(e,Xn(20));f.position.set(3.235,11.486,-12.541),f.scale.set(2.5,2,.1),this.add(f);const h=new gt(e,Xn(100));h.position.set(0,20,0),h.scale.set(1,.1,1),this.add(h)}dispose(){const e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(const t of e)t.dispose()}};function Xn(e){return new Tc({color:0,emissive:16777215,emissiveIntensity:e})}export{B as A,Gc as C,zt as D,Ed as E,ic as O,Nt as S,gc as T,Md as _,hr as a,bd as b,Rd as c,Ad as d,Sd as f,ja as g,pc as h,wd as i,Td as k,yd as l,Ci as m,na as n,Yt as o,Cd as p,Pd as r,It as s,Ld as t,vc as u,gt as v,xd as w,$r as x,$a as y};
