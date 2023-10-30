const ZERO = [0.75, 0.375, 0.0];

async function getColorOfLight() {
    try {
        const response = await fetch(`color`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        });

        if (!response.ok) {
            console.error('Network response was not ok', response.statusText);
            return ZERO;
        }

        const data = await response.json();

        return data.color;

    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }

    return ZERO;
}