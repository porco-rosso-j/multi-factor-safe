import fs from "fs";
import {
	InitArgs,
	init,
	generateArgs,
	prove,
	artifactUrls,
	packGroth16Proof,
	ArtifactsOrigin,
} from "@anon-aadhaar/core";
import * as ethers from "ethers";

const testQRData =
	"695108307045527203055615552134508634869313570552656618109233293826809783744740943419664633244789595167713616229940888614796945806734127014626352741684030945836682755701826158997285597433538025488366925740167042313258421555158263376489516574414973626511952422530378167351761483902317726425479276681398706404027021668462750945309137284781004807883235348690435173364532655708132246054480087919979911420835876270757157724423305072398746259365436956515158675590610940613221283186928985095014363753644026616020658671545292832317012970018776029942668195382119316166872414816641495204533019228341944862387949237376719908215527521051536910836826337010634089611506285345556700025661890128599852071325670571388847852371059666043822101873535405244725142605136703231883285829173360033996634992186389333290608843642666629465935091143220805070061580439995964606787199200177013377580377293973760699768857122809711626741480779223104615190168015897960238979621114528434483492447129294660468427646529906701023372584731450970938498041155687450856908757662893566263021701574742069654601049881179287520669139108737016968027537217187159082615048934006298702469369922701981709623500287052034886782189392264083180391965103311557616605297746485535037419325101344595814521142058760729607758097113222280147904170712200469271127319655887247100867552609087127471213997902441066511842857046432231796787127028448224272935417706915024489615581925252098848622721066725651969871301027935892864953940235802117625078147817233067126709359720610644652920664606647794820295270155260561543551379196340339946259428013895534277687341066665207622255094389626600546504439939534641137309840288232503260577135489438215262390266144898836480727381360776696509008207489586420692296796543569442368003046004750120447046343344292830540114928491956637083863213018892557537669036216266303688255805737810094125533593334586152076561648004797198379482402031172686411389878942457481845062531287426760130276261105341084050642584258137081925655395883051746491697684001866887948506582173011030710930783083177533985683495856951896101398254500924065525545816210794978224494579384189985209622968107751068638201455700125198648454580350875690895192749842035354906366387545329127690145779923362565861798164999755364766601464577334686706113707256692961048840925481639721719038107556802098527110364351239973473223641822458898218542501440584613079175728866118046507798400683157338288108589226343825904319386848433748775611436553829911165131277396195955192419066279703155881652636340864296839625126510440542649117958510403298031288293151739519743433869244170333193220051857919796402087808548112811036150925434128166314661780533122780862591597070180951424098811874679594194598857430711505010943322469248438739827786454788200011306267387812547480271271158614611671910430376825402414529426547530626829043778407029772276816671465499011310830356198398821075780895122829494675692651372545295425396842663158702556187984779965115461888780376289490668366454073174963971723088325328288973508087411605822328962593396031832909073194740913843248845328715612394243083955154331891624601151678963588001754923544947134641099366604610651767579307080871545708369809071682515676119768289240637204851857970508787730410194087103355897796450376651833660493968887104962770231726532194098734676352364986077034220084846990679567858429556450371938857292323716172860250800757053393";

// safe op hash
const signal =
	"0x687f1fe30ca2db05608adc61300aa7073ba2492e9fa51d18844cdb99cffed07d";

const nullifierSeed = 1234;

async function generateProofs() {
	const certificate = fs
		.readFileSync(__dirname + "/testCertificate.pem")
		.toString();

	const anonAadhaarInitArgs: InitArgs = {
		wasmURL: artifactUrls.v2.wasm,
		zkeyURL: artifactUrls.v2.zkey,
		vkeyURL: artifactUrls.v2.vk,
		artifactsOrigin: ArtifactsOrigin.server,
	};

	await init(anonAadhaarInitArgs);

	const args = await generateArgs({
		qrData: testQRData,
		certificateFile: certificate,
		nullifierSeed: nullifierSeed,
		signal: signal, // user op hash
	});

	const anonAadhaarCore = await prove(args);
	const anonAadhaarProof = anonAadhaarCore.proof;
	const packedGroth16Proof = packGroth16Proof(anonAadhaarProof.groth16Proof);

	const encoder = ethers.AbiCoder.defaultAbiCoder();
	const proofData = encoder.encode(
		["uint", "uint", "uint[4]", "uint[8]"],
		[
			BigInt(nullifierSeed),
			Number(anonAadhaarCore?.proof.timestamp),
			[
				anonAadhaarProof.ageAbove18,
				anonAadhaarProof.gender,
				anonAadhaarProof.pincode,
				anonAadhaarProof.state,
			],
			packedGroth16Proof,
		]
	);

	console.log("anonAadhaarProof.nullifier: ", anonAadhaarProof.nullifier);
	console.log(`proofData: `, proofData);
}

generateProofs();
