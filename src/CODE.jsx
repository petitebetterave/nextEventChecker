import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import playersData from '../DATA/players.json';

/**
 * Fetches the next match data for a given player.
 * @param {string} playerLeagueId - The league ID of the player.
 * @param {string} playerTeamId - The team ID of the player.
 * @returns {Promise<Object>} - The JSON response from the API or null if an error occurs.
 */
const fetchPlayerNextMatch = async (playerLeagueId, playerTeamId) => {
  try {
    const response = await fetch(`https://site.web.api.espn.com/apis/site/v2/sports/soccer/${playerLeagueId}/teams/${playerTeamId}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching data for league ${playerLeagueId} and team ${playerTeamId}:`, error.message);
    return null; // Retourne null en cas d'erreur
  }
};

/**
 * Logs the next match details for a player.
 * @param {string} playerName - The name of the player.
 * @param {Object} team - The team data containing the next match information.
 */
const logNextMatchDetails = (playerName, team) => {
  if (!team || !team.nextEvent || !team.nextEvent[0]) {
    console.error(`No next event data found for player: ${playerName}`);
    return;
  }

  const fixture = team.nextEvent[0];
  const matchDate = new Date(fixture.date);

  console.log(
    `${playerName}\n` +
    `${matchDate.toLocaleString()}\n` +
    `${fixture.name.split('at')[0]} : ${fixture.name.split('at')[1]}\n` +
    `${fixture.shortName}\n` +
    `${fixture.season.displayName}`
  );
};

function App() {
  const [checkedState, setCheckedState] = useState(playersData.map(() => true));
  const [logs, setLogs] = useState(''); // Pour afficher les logs dans l'interface

  /**
   * Handles the change event for the checkboxes.
   * @param {number} index - The index of the checkbox that was changed.
   */
  const handleCheckboxChange = (index) => {
    const updatedCheckedState = checkedState.map((isChecked, idx) =>
      idx === index ? !isChecked : isChecked
    );
    setCheckedState(updatedCheckedState);
  };

  /**
   * Handles the button click event to log the next match details for selected players.
   */
  const handleButtonClick = async () => {
    const selectedPlayers = playersData.filter((_, index) => checkedState[index]);
    let logMessages = '';

    const results = await Promise.allSettled(
      selectedPlayers.map(async (player) => {
        const teamData = await fetchPlayerNextMatch(player.espn_league, player.espn_club_id);
        return { player, teamData };
      })
    );

    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.teamData) {
        const fixture = result.value.teamData.team.nextEvent[0];
        const matchDate = new Date(fixture.date);
        logMessages +=
          `${result.value.player.name}\n` +
          `${matchDate.toLocaleString()}\n` +
          `${fixture.name.split('at')[0]} : ${fixture.name.split('at')[1]}\n` +
          `${fixture.shortName}\n` +
          `${fixture.season.displayName}\n\n`;
      } else {
        // Ajoute le message d'erreur en rouge
        logMessages += `<span class="error">ERREUR - données non open source: ${result.value?.player.name}</span>\n\n`;
      }
    });

    setLogs(logMessages); // Met à jour les logs dans l'interface
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Checker prochain match</h1>
      </header>
      <main className="main-container">
        <div className="content">
          <div className="players-list">
            {playersData.map((player, index) => (
              <div className="player-item" key={player.id}>
                <input
                  type="checkbox"
                  checked={checkedState[index]}
                  onChange={() => handleCheckboxChange(index)}
                />
                <label>{player.name}</label>
              </div>
            ))}
          <button type="button" onClick={handleButtonClick}>Générer le truc</button>
          </div>
        </div>
        {logs && (
          <div className="output">
            <h3>Résultats:</h3>
            <div className="console-log" dangerouslySetInnerHTML={{ __html: logs }} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;