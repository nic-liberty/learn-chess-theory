import type { Opening } from './types'

// Shared move orders. Notes on shared moves only need to be written once.
const SCOTCH =
  '1.e4 e5 2.Nf3 Nc6 3.d4 {The Scotch. White strikes in the centre at once instead of 3.Bb5 or 3.Bc4.}'
const MAIN = `${SCOTCH} 3...exd4 {Black almost always takes. 3...Nxd4 and 3...d6 are playable but passive.} 4.Nxd4 {White gets a free hand in the centre. Black usually hits back with 4...Nf6, 4...Bc5 or 4...Qh4.}`

const SCHMIDT = `${MAIN} 4...Nf6 {The Schmidt Variation. Black attacks e4 straight away.}`
const MIESES = `${SCHMIDT} 5.Nxc6 {White trades first so that e5 comes with tempo.} 5...bxc6 {Recapture toward the centre.} 6.e5 {Kicks the knight.} 6...Qe7 {Pins the e-pawn: White's queen must guard it.} 7.Qe2 7...Nd5 8.c4 {The Mieses Variation, the critical main line.}`
const SCOTCH_4N = `${SCHMIDT} 5.Nc3 {The Scotch Four Knights. Quieter: White just defends e4 and develops.}`

const CLASSICAL = `${MAIN} 4...Bc5 {The Classical. The bishop eyes d4 and f2.}`
const CL_BE3 = `${CLASSICAL} 5.Be3 {Defends the knight and offers to trade the strong bishop.} 5...Qf6 {Pressure on d4.} 6.c3 {Now d4 is solid.} 6...Nge7 {Not ...Nf6, so the f-pawn and queen stay connected.}`
const CL_NXC6 = `${CLASSICAL} 5.Nxc6 {Kasparov's favourite. White removes the knight before Black can pile up on d4.} 5...Qf6 {The sharpest. Black threatens mate on f2.} 6.Qd2 {Guards f2 and keeps the option of Nc3.}`

const STEINITZ = `${MAIN} 4...Qh4 {The Steinitz Variation. Black grabs at e4 but the queen comes out early.}`

const GAMBIT = `${SCOTCH} 3...exd4 4.Bc4 {The Scotch Gambit. White develops fast and lets Black keep the pawn for now.}`
const GAMBIT_NF6 = `${GAMBIT} 4...Nf6 {Attacks e4, leading to very sharp play.}`

const GORING = `${SCOTCH} 3...exd4 4.c3 {The Göring Gambit. White offers a pawn, or two, for rapid development.}`

export const scotch: Opening = {
  id: 'scotch',
  name: 'Scotch Game',
  eco: 'C44–C45',
  description:
    '1.e4 e5 2.Nf3 Nc6 3.d4. An open, direct answer to 1...e5 that blows open the centre on move three.',
  lines: [
    // ── Schmidt / Mieses ─────────────────────────────────────────
    {
      id: 'mieses-ba6',
      group: 'Schmidt (4...Nf6)',
      name: 'Mieses: 8...Ba6 9.b3 g6',
      pgn: `${MIESES} 8...Ba6 {Pins the c4-pawn to the queen. This is the main line.} 9.b3 {Unpins by protecting c4 and prepares Bb2.} 9...g6 {The bishop goes to g7 to pressure e5.} 10.g3 Bg7 11.Bb2 O-O 12.Bg2 Rfe8 13.O-O {White has an extra space on the queenside; Black hopes to undermine e5.}`,
    },
    {
      id: 'mieses-ba6-g5',
      group: 'Schmidt (4...Nf6)',
      name: 'Mieses: 8...Ba6 9.b3 g5',
      pgn: `${MIESES} 8...Ba6 9.b3 g5 {A modern idea: Black stops f4 and plans ...Bg7 to hit e5.} 10.Bb2 {Calm development, guarding e5 once more.} 10...O-O-O 11.Qd2 {Steps out of the pin on the a6-f1 diagonal.} 11...Nb6 12.Be2 Bg7 {Black piles up on e5; White has more space.}`,
    },
    {
      id: 'mieses-ba6-ooo',
      group: 'Schmidt (4...Nf6)',
      name: 'Mieses: 8...Ba6 9.b3 O-O-O',
      pgn: `${MIESES} 8...Ba6 9.b3 O-O-O {Black castles long and hopes to break with ...d6 or ...f6.} 10.g3 {Plans Bg2 to aim down the long diagonal.} 10...Re8 11.Bb2 f6 12.Bg2 {Black challenges e5; White develops calmly.}`,
    },
    {
      id: 'mieses-nb6',
      group: 'Schmidt (4...Nf6)',
      name: 'Mieses: 8...Nb6',
      pgn: `${MIESES} 8...Nb6 {Retreats out of the pin.} 9.Nd2 {The knight heads to f3 or e4.} 9...Qe6 10.b3 a5 11.Bb2 Bb4 12.a3 {White kicks the bishop and keeps the extra space.}`,
    },
    {
      id: 'schmidt-6nd5',
      group: 'Schmidt (4...Nf6)',
      name: '6.e5 Nd5 (without ...Qe7)',
      pgn: `${SCHMIDT} 5.Nxc6 bxc6 6.e5 Nd5 {Less accurate than 6...Qe7, as White can gain time.} 7.c4 Nb6 8.Bd3 {Simple development. White's space gives a pleasant game.}`,
    },
    {
      id: 'schmidt-6bd3',
      group: 'Schmidt (4...Nf6)',
      name: '6.Bd3',
      pgn: `${SCHMIDT} 5.Nxc6 bxc6 6.Bd3 {Quieter than 6.e5. White defends e4 and castles.} 6...d5 {Black takes the centre.} 7.exd5 cxd5 8.O-O Be7 9.Re1 O-O {Black has a free game with the hanging pawns.}`,
    },
    {
      id: 'scotch4n-main',
      group: 'Schmidt (4...Nf6)',
      name: 'Scotch Four Knights: 5...Bb4 main line',
      pgn: `${SCOTCH_4N} 5...Bb4 {Pins the knight and pressures e4 again.} 6.Nxc6 bxc6 7.Bd3 {Defends e4.} 7...d5 {Black frees their game.} 8.exd5 cxd5 9.O-O O-O 10.Bg5 {Pins the f6-knight.} 10...c6 {Solidifies d5.} 11.Qf3 Be7 12.Rae1 {The main tabiya. White pressures along the e-file.}`,
    },
    {
      id: 'scotch4n-qe7',
      group: 'Schmidt (4...Nf6)',
      name: 'Scotch Four Knights: 8...Qe7+',
      pgn: `${SCOTCH_4N} 5...Bb4 6.Nxc6 bxc6 7.Bd3 d5 8.exd5 Qe7+ {Black forces a queen trade.} 9.Qe2 Nxd5 10.Qxe7+ Kxe7 {An equal endgame.}`,
    },

    // ── Classical ────────────────────────────────────────────────
    {
      id: 'classical-be3-bc4-oo',
      group: 'Classical (4...Bc5)',
      name: '5.Be3 Qf6 6.c3 Nge7 7.Bc4 O-O',
      pgn: `${CL_BE3} 7.Bc4 {The main move. White develops and eyes f7.} 7...O-O 8.O-O Bb6 {Steps away from the trade and keeps pressure on d4.} 9.Nc2 {Unpins from the bishop on b6.} 9...d6 10.Bxb6 axb6 11.f4 {White grabs space with a kingside pawn advance.}`,
    },
    {
      id: 'classical-be3-bc4-ne5',
      group: 'Classical (4...Bc5)',
      name: '5.Be3 Qf6 6.c3 Nge7 7.Bc4 Ne5',
      pgn: `${CL_BE3} 7.Bc4 Ne5 {Hits the bishop.} 8.Be2 Qg6 {Now e4 and g2 are both attacked.} 9.O-O {White castles and leaves e4 hanging: grabbing it with ...Qxe4 lets White's knight jump to b5 with strong threats.}`,
    },
    {
      id: 'classical-be3-g3',
      group: 'Classical (4...Bc5)',
      name: '5.Be3 Qf6 6.c3 Nge7 7.g3',
      pgn: `${CL_BE3} 7.g3 {Plans Bg2 for a slower game.} 7...d5 {Black strikes back immediately.} 8.Bg2 dxe4 9.O-O {White gives the e-pawn for fast development and pressure on the long diagonal. Don't play 9.Bxe4, which leaves White worse.}`,
    },
    {
      id: 'classical-be3-bb6',
      group: 'Classical (4...Bc5)',
      name: '5.Be3 Bb6',
      pgn: `${CLASSICAL} 5.Be3 Bb6 {Avoids the trade without bringing the queen out.} 6.Nf5 {Offers to trade off Black's good bishop.} 6...Bxe3 7.Nxe3 Nf6 8.Nc3 O-O 9.Bd3 {Comfortable development for White.}`,
    },
    {
      id: 'classical-nxc6-qd2',
      group: 'Classical (4...Bc5)',
      name: '5.Nxc6 Qf6 6.Qd2 dxc6',
      pgn: `${CL_NXC6} 6...dxc6 {Opens lines for the bishops.} 7.Nc3 Be6 8.Na4 {Hits the strong c5-bishop.} 8...Rd8 9.Bd3 Bd4 10.O-O {White keeps the bishop pair hopes and a slightly better structure.}`,
    },
    {
      id: 'classical-nxc6-qf3',
      group: 'Classical (4...Bc5)',
      name: '5.Nxc6 Qf6 6.Qf3',
      pgn: `${CL_NXC6.replace(' 6.Qd2 {Guards f2 and keeps the option of Nc3.}', '')} 6.Qf3 {Offers a queen trade right away.} 6...bxc6 7.Nd2 d6 8.Nb3 Bb6 {A calm game with roughly equal chances.}`,
    },
    {
      id: 'classical-nxc6-bxc6',
      group: 'Classical (4...Bc5)',
      name: '5.Nxc6 bxc6',
      pgn: `${CLASSICAL} 5.Nxc6 bxc6 {Simple recapture toward the centre.} 6.Bd3 d6 7.O-O Nf6 8.h3 O-O 9.Nc3 {White has slightly more space.}`,
    },
    {
      id: 'classical-nb3',
      group: 'Classical (4...Bc5)',
      name: '5.Nb3',
      pgn: `${CLASSICAL} 5.Nb3 {Kicks the bishop at once.} 5...Bb6 6.a4 {Threatens a5 to trap the bishop.} 6...a6 {Makes room for the bishop.} 7.Nc3 d6 8.Nd5 Ba7 9.Be2 {A strong knight on d5 for White.}`,
    },
    {
      id: 'classical-qf6-transpose',
      group: 'Classical (4...Bc5)',
      name: '4...Qf6 (transposes)',
      pgn: `${MAIN} 4...Qf6 {Pressure on d4, often transposing to the Classical.} 5.Be3 Bc5 6.c3 Nge7 7.Bc4 {Back in the Classical main line.}`,
    },

    // ── Steinitz ─────────────────────────────────────────────────
    {
      id: 'steinitz-nb5',
      group: 'Steinitz (4...Qh4)',
      name: '5.Nb5',
      pgn: `${STEINITZ} 5.Nb5 {Counterattacks c7 at once.} 5...Bb4+ 6.Bd2 Qxe4+ 7.Be2 {White has given up the e-pawn for big development.} 7...Kd8 {Covers c7.} 8.O-O Bxd2 9.Nxd2 Qg6 10.Bf3 {Black's king is stuck in the centre: good compensation.}`,
    },
    {
      id: 'steinitz-nc3',
      group: 'Steinitz (4...Qh4)',
      name: '5.Nc3',
      pgn: `${STEINITZ} 5.Nc3 {Develops and defends e4 indirectly.} 5...Bb4 6.Be2 {Gives up the pawn for speed.} 6...Qxe4 7.Nb5 {Hits c7.} 7...Bxc3+ 8.bxc3 Kd8 9.O-O {Black's king is a long-term problem.}`,
    },

    // ── Other 4th moves ──────────────────────────────────────────
    {
      id: 'sideline-bb4',
      group: 'Other 4th moves',
      name: '4...Bb4+',
      pgn: `${MAIN} 4...Bb4+ {A check that achieves little.} 5.c3 Bc5 6.Be3 Bb6 7.Bc4 {White has gained a useful c3 for free.}`,
    },
    {
      id: 'sideline-nxd4',
      group: 'Other 4th moves',
      name: '4...Nxd4',
      pgn: `${MAIN} 4...Nxd4 {Trades, but brings White's queen to a great square.} 5.Qxd4 d6 6.Nc3 Nf6 7.Bg5 Be7 8.O-O-O {Big lead in development for White.}`,
    },
    {
      id: 'sideline-g6',
      group: 'Other 4th moves',
      name: '4...g6',
      pgn: `${MAIN} 4...g6 {A fianchetto, a bit slow here.} 5.Nc3 Bg7 6.Be3 Nf6 7.Nxc6 bxc6 8.e5 Ng8 9.f4 {White has a big space advantage.}`,
    },
    {
      id: 'sideline-d6',
      group: 'Other 4th moves',
      name: '4...d6',
      pgn: `${MAIN} 4...d6 {Solid but passive.} 5.Nc3 Nf6 6.Be2 Be7 7.O-O O-O {White has the freer game.}`,
    },

    // ── Other 3rd moves ──────────────────────────────────────────
    {
      id: 'third-nxd4',
      group: 'Other 3rd moves',
      name: '3...Nxd4',
      pgn: `${SCOTCH} 3...Nxd4 {Trades knights but lets White's queen centralise.} 4.Nxd4 exd4 5.Qxd4 Ne7 6.Bc4 {White leads in development.}`,
    },
    {
      id: 'third-d6',
      group: 'Other 3rd moves',
      name: '3...d6',
      pgn: `${SCOTCH} 3...d6 {Holds e5, but it's passive.} 4.Bb5 {Pins the knight and increases pressure on e5.} 4...Bd7 5.Nc3 Nf6 6.O-O {Black will soon have to give up the centre.}`,
    },

    // ── Scotch Gambit ────────────────────────────────────────────
    {
      id: 'gambit-max-lange',
      group: 'Scotch Gambit (4.Bc4)',
      name: 'Max Lange Attack',
      pgn: `${GAMBIT_NF6} 5.O-O {Castle first, then hit the centre.} 5...Bc5 6.e5 d5 {The only good answer: counterattack the bishop.} 7.exf6 dxc4 8.Re1+ Be6 9.Ng5 Qd5 10.Nc3 Qf5 11.Nce4 O-O-O {Wild tactics. Both sides must know this by heart.}`,
    },
    {
      id: 'gambit-5oo-nxe4',
      group: 'Scotch Gambit (4.Bc4)',
      name: '5.O-O Nxe4',
      pgn: `${GAMBIT_NF6} 5.O-O Nxe4 {Black takes a second pawn.} 6.Re1 d5 7.Bxd5 Qxd5 8.Nc3 {Hits the queen and pins the knight.} 8...Qa5 9.Nxe4 Be6 10.Neg5 O-O-O 11.Nxe6 fxe6 12.Rxe6 Bd6 {Material is roughly level and Black is active.}`,
    },
    {
      id: 'gambit-5e5',
      group: 'Scotch Gambit (4.Bc4)',
      name: '5.e5',
      pgn: `${GAMBIT_NF6} 5.e5 {Kicks the knight.} 5...d5 {The correct counter.} 6.Bb5 Ne4 7.Nxd4 Bd7 8.Bxc6 bxc6 9.O-O Bc5 {Black's pieces are active; about equal.}`,
    },
    {
      id: 'gambit-bc5-c3',
      group: 'Scotch Gambit (4.Bc4)',
      name: '4...Bc5 5.c3',
      pgn: `${GAMBIT} 4...Bc5 {Holds on to d4.} 5.c3 {Attacks d4 and offers more material.} 5...Nf6 {Hits e4.} 6.e5 d5 7.Bb5 Ne4 8.cxd4 Bb6 9.Nc3 O-O 10.Be3 {White has the centre, Black has active pieces.}`,
    },

    // ── Göring Gambit ────────────────────────────────────────────
    {
      id: 'goring-accepted',
      group: 'Göring Gambit (4.c3)',
      name: 'Accepted: 4...dxc3',
      pgn: `${GORING} 4...dxc3 {Black takes the pawn.} 5.Nxc3 {Fast development for the pawn.} 5...Bb4 {Pins the knight.} 6.Bc4 d6 7.O-O Bxc3 8.bxc3 Nf6 {White has the bishop pair and open lines.}`,
    },
    {
      id: 'goring-d5',
      group: 'Göring Gambit (4.c3)',
      name: 'Declined: 4...d5',
      pgn: `${GORING} 4...d5 {The safest reply, giving the pawn back.} 5.exd5 Qxd5 6.cxd4 Bg4 {Pressure on d4.} 7.Be2 Bb4+ 8.Nc3 {About equal.}`,
    },
    {
      id: 'goring-nf6',
      group: 'Göring Gambit (4.c3)',
      name: 'Declined: 4...Nf6',
      pgn: `${GORING} 4...Nf6 {Counterattack on e4.} 5.e5 Nd5 6.cxd4 d6 {Black hits the e5-pawn.} 7.Bc4 Nb6 8.Bb5 {Keeps tension in the centre.}`,
    },
  ],
}
