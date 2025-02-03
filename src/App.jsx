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

function App() {
  const [checkedState, setCheckedState] = useState(playersData.map(() => true));
  const [logs, setLogs] = useState([]); // Pour afficher les logs dans l'interface

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
    const logMessages = [];

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
        logMessages.push(
          <div key={result.value.player.id}>
            <strong>{result.value.player.name}</strong><br />
            {result.value.player.sex === 1 ? 'Masculin' : 'Féminines'}<br />
            {matchDate.toLocaleString()}<br />
            {fixture.name.split('at')[0]} : {fixture.name.split('at')[1]}<br />
            {fixture.shortName}<br />
            {fixture.season.displayName}<br /><br />
          </div>
        );
      } else {
        // Ajoute le message d'erreur en rouge
        logMessages.push(
          <div key={result.value?.player.id} className="error">
            ERREUR - données non accessibles pour : {result.value?.player.name}<br /><br />
          </div>
        );
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
        {logs.length > 0 && (
          <div className="output">
            <h3>Résultats:</h3>
            <div className="console-log">
              {logs}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
