
import {
  evaluateSignal,
  createVoteRecord,
} from "./governance";

const votes = createVoteRecord();

votes.genuine = 7;
votes.suspicious = 1;

console.log(
  "Genuine result:",
  evaluateSignal(votes, "genuine")
);

console.log(
  "Resolved without evidence:",
  evaluateSignal(
    {
      genuine: 0,
      duplicate: 0,
      resolved: 5,
      suspicious: 0,
    },
    "resolved"
  )
);
